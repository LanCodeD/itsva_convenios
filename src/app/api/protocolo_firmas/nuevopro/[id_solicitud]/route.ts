import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";

export async function GET(
  request: Request,
  { params }: { params: { id_solicitud: string } }
) {
  const connection = await connectDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const usuarioId = session.user?.id;
    const isAdmin = session.user?.role === "administrador"; // Verifica si es administrador
    const { id_solicitud } = params;

    //console.log("Este id pasa en el backend GET ESTADO FIRMAS: ", id_solicitud);

    // Verifica que el id_solicitudes sea válido
    if (!id_solicitud) {
      return NextResponse.json(
        { message: "ID de solicitud no proporcionado" },
        { status: 400 }
      );
    }

    let solicitudRows: any[];

    if (isAdmin) {
      // Si es administrador, no filtramos por usuario_id
      const [rows]: [any[], any] = await connection.execute(
        "SELECT protocolo_firmas_id FROM solicitudes_convenios WHERE id_solicitudes = ?",
        [id_solicitud]
      );
      solicitudRows = rows; // Asignamos rows a solicitudRows
    } else {
      // Si es un usuario regular, filtramos por usuario_id
      const [rows]: [any[], any] = await connection.execute(
        "SELECT protocolo_firmas_id FROM solicitudes_convenios WHERE id_solicitudes = ? AND usuario_id = ?",
        [id_solicitud, usuarioId]
      );
      solicitudRows = rows; // Asignamos rows a solicitudRows
    }

    // Verificación de que se encontraron resultados
    if (!solicitudRows || solicitudRows.length === 0) {
      return NextResponse.json(
        { message: "No se encontró la solicitud para este usuario" },
        { status: 404 }
      );
    }

    const id_protocolo_firmas = solicitudRows[0].protocolo_firmas_id;

    // SEGUNDO: Ahora obtenemos los datos de la tabla subir_convenio usando id_subir_convenio
    const [rows]: [any[], any] = await connection.execute(
      "SELECT pro.requiere_protocolo, pro.estado_validacion, pro.fecha_seleccionada FROM protocolo_firmas pro WHERE pro.id_protocolo_firmas = ?",
      [id_protocolo_firmas]
    );
    console.log("contenido del GET FIRMAS:", rows);

    /*       if (!rows || rows.length === 0) {
        return NextResponse.json(
          { message: "No se encontró el convenio para este usuario y solicitud" },
          { status: 404 }
        );
      } */
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        message: "Contenido de 0, puede subir archivo",
      });
    }

    return NextResponse.json(rows[0]); // Devuelve la primera fila encontrada
  } catch (error: any) {
    console.error("Error fetching convenio_solicitud:", error.message || error);
    return NextResponse.json(
      { message: "Error al obtener los datos", error: error.message || error },
      { status: 500 }
    );
  } finally {
    connection.release(); // Devuelve la conexión al pool de conexiones
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id_solicitud: string } }
) {
  const connection = await connectDB();
  try {
    // 1) Autenticación y autorización
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const usuarioId = session.user!.id;

    // 2) Extraer y validar ID de solicitud
    const { id_solicitud } = params;
    if (!id_solicitud) {
      return NextResponse.json(
        { message: "ID de solicitud no proporcionado" },
        { status: 400 }
      );
    }

    // 3) Leer body
    const { requiere_protocolo, fecha_seleccionada } = await request.json();

    // 4) Iniciar transacción
    await connection.beginTransaction();

    // 5) Verificar existencia y pertenencia de la solicitud
    const [solRows]: any[] = await connection.execute(
      `SELECT protocolo_firmas_id, estado_secciones
           FROM solicitudes_convenios
          WHERE id_solicitudes = ?
            AND usuario_id = ?`,
      [id_solicitud, usuarioId]
    );
    if (!solRows.length) {
      await connection.rollback();
      return NextResponse.json(
        { message: "No se encontró la solicitud o no te pertenece" },
        { status: 404 }
      );
    }

    const { protocolo_firmas_id, estado_secciones: rawSecciones } = solRows[0];
    if (!protocolo_firmas_id) {
      await connection.rollback();
      return NextResponse.json(
        { message: "No hay protocolo de firmas asociado" },
        { status: 404 }
      );
    }
    const estadoSecciones = rawSecciones ? JSON.parse(rawSecciones) : {};

    // 6) Actualizar protocolo_firmas
    await connection.execute(
      `UPDATE protocolo_firmas
            SET requiere_protocolo  = ?,
                fecha_seleccionada = ?
          WHERE id_protocolo_firmas = ?`,
      [
        requiere_protocolo === "sí" ? 1 : 0,
        requiere_protocolo === "sí" ? fecha_seleccionada : null,
        protocolo_firmas_id,
      ]
    );

    // 7) Marcar sección como completada
    estadoSecciones.protocolo_firmas = "completado";
    await connection.execute(
      `UPDATE solicitudes_convenios
            SET estado_secciones = ?
          WHERE id_solicitudes = ?`,
      [JSON.stringify(estadoSecciones), id_solicitud]
    );

    // 8) Insertar notificación
    const [adminRows]: any[] = await connection.execute(
      `SELECT id_usuario
           FROM usuario
          WHERE rol = 'administrador'
          LIMIT 1`
    );

    // 7.1) Obtener nombre del usuario solicitante
    const [usuarioData]: any[] = await connection.execute(
      `SELECT nombre FROM usuario WHERE id_usuario = ?`,
      [usuarioId]
    );
    const nombreUsuario = usuarioData[0]?.nombre || "Un usuario";

    const adminId = adminRows[0]?.id_usuario;
    console.log("Esto es el adminID", adminId);

    if (adminId) {
      const mensaje = `${nombreUsuario} ha corregido la sección de Protocolo de Firmas. Lista para revisión.`;

      const [notifResult]: any = await connection.execute(
        `INSERT INTO notificaciones
             (usuario_id, solicitud_id, mensaje, tipo_notificacion, leido)
           VALUES (?, ?, ?, ?, ?)`,
        [adminId, id_solicitud, mensaje, "Solicitud Completa", false]
      );
      console.log(
        "Notificación creada, affectedRows:",
        notifResult.affectedRows
      );
    } else {
      console.warn("No se encontró ningún administrador.");
    }

    // 9) Commit de la transacción
    await connection.commit();

    return NextResponse.json(
      {
        message: "Protocolo de firma y notificación enviados correctamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    await connection.rollback();
    console.error(
      "Error al actualizar el protocolo de firmas:",
      error.message || error
    );
    return NextResponse.json(
      {
        message: "Error al actualizar el protocolo de firmas",
        error: error.message || error,
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

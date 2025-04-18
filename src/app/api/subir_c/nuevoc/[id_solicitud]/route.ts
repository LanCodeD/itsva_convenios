import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";
import cloudinary from "@/libs/cloudinary";

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

    //console.log("Este id pasa en el backend GET ESTADO: ", id_solicitud);

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
        "SELECT subir_convenio_id FROM solicitudes_convenios WHERE id_solicitudes = ?",
        [id_solicitud]
      );
      solicitudRows = rows; // Asignamos rows a solicitudRows
    } else {
      // Si es un usuario regular, filtramos por usuario_id
      const [rows]: [any[], any] = await connection.execute(
        "SELECT subir_convenio_id FROM solicitudes_convenios WHERE id_solicitudes = ? AND usuario_id = ?",
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

    const id_subir_convenio = solicitudRows[0].subir_convenio_id;

    // SEGUNDO: Ahora obtenemos los datos de la tabla subir_convenio usando id_subir_convenio
    const [rows]: [any[], any] = await connection.execute(
      "SELECT sub.convenio_subir, sub.estado_validacion, sub.fecha_subida FROM subir_convenio sub WHERE sub.id_subir_convenio = ?",
      [id_subir_convenio]
    );
    console.log("contenido del GET:", rows);

    /*     if (!rows || rows.length === 0) {
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
    // 1) Autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const usuarioId = session.user!.id;

    // 2) Desestructuramos id_solicitud
    const { id_solicitud } = params;
    if (!id_solicitud) {
      return NextResponse.json(
        { message: "ID de solicitud no proporcionado" },
        { status: 400 }
      );
    }

    // 3) Iniciar transacción
    await connection.beginTransaction();

    // 4) Recuperar subir_convenio_id y estado_secciones
    const [solicitudRows]: any[] = await connection.execute(
      `SELECT subir_convenio_id, estado_secciones
         FROM solicitudes_convenios
        WHERE id_solicitudes = ?
          AND usuario_id = ?`,
      [id_solicitud, usuarioId]
    );
    if (!solicitudRows.length) {
      await connection.rollback();
      return NextResponse.json(
        { message: "No se encontró la solicitud para este usuario" },
        { status: 404 }
      );
    }
    const { subir_convenio_id, estado_secciones: rawSecciones } =
      solicitudRows[0];
    const estadoSecciones = rawSecciones ? JSON.parse(rawSecciones) : {};

    // 5) Actualizar subir_convenio
    const { convenio_subir } = await request.json();
    if (!convenio_subir) {
      await connection.rollback();
      return NextResponse.json(
        { message: "No se ha proporcionado la URL del archivo" },
        { status: 400 }
      );
    }
    await connection.execute(
      `UPDATE subir_convenio
          SET convenio_subir = ?, 
              fecha_subida   = NOW()
        WHERE id_subir_convenio = ?`,
      [convenio_subir, subir_convenio_id]
    );

    // 6) Actualizar estado_secciones
    estadoSecciones.subir_convenio = "completado";
    estadoSecciones.protocolo_firmas = "completado";
    await connection.execute(
      `UPDATE solicitudes_convenios
          SET estado_secciones = ?
        WHERE id_solicitudes = ?`,
      [JSON.stringify(estadoSecciones), id_solicitud]
    );

    // 7) Insertar notificación
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
      const mensaje = `${nombreUsuario} ha corregido la sección de Subida de Archivos. Lista para revisión.`;
    
      const [notifResult]: any = await connection.execute(
        `INSERT INTO notificaciones
           (usuario_id, solicitud_id, mensaje, tipo_notificacion, leido)
         VALUES (?, ?, ?, ?, ?)`,
        [
          adminId,
          id_solicitud,
          mensaje,
          "Solicitud Completa",
          false
        ]
      );
      console.log("Notificación creada, affectedRows:", notifResult.affectedRows);
    } else {
      console.warn("No se encontró ningún administrador.");
    }

    // 8) Commit
    await connection.commit();

    return NextResponse.json(
      {
        message:
          "Subida de convenios guardada con éxito y notificación enviada al administrador",
      },
      { status: 200 }
    );
  } catch (error: any) {
    await connection.rollback();
    console.error("Error al actualizar convenio:", error.message || error);
    return NextResponse.json(
      {
        message: "Error al actualizar el archivo",
        error: error.message || error,
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

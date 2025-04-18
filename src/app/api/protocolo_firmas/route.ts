import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  const connection = await connectDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const usuarioId = session.user?.id;
    const { requiere_protocolo, fecha_seleccionada } = await request.json();
    const estadoValidacionInicial = "pendiente";

    await connection.beginTransaction();

    // Inserta el protocolo en la tabla protocolo_firmas
    const [protocoloResult]: any = await connection.execute(
      "INSERT INTO protocolo_firmas (usuario_id, requiere_protocolo, fecha_seleccionada, estado_validacion) VALUES (?, ?, ?, ?)",
      [
        usuarioId,
        requiere_protocolo === "sí" ? 1 : 0,
        requiere_protocolo === "sí" ? fecha_seleccionada : null,
        estadoValidacionInicial
      ]
    );

    const protocoloId = protocoloResult.insertId;

    // Verifica si existe una solicitud activa en la tabla solicitudes_convenios
    const [existingSolicitud]: any = await connection.execute(
      `SELECT id_solicitudes, estado_secciones FROM solicitudes_convenios WHERE usuario_id = ? AND protocolo_firmas_id IS NULL AND estado_solicitud = 'subir' ORDER BY id_solicitudes DESC LIMIT 1`,
      [usuarioId]
    );

    if (existingSolicitud.length === 0) {
      return NextResponse.json(
        {
          message:
            "No se ha encontrado ninguna solicitud activa para el usuario",
        },
        { status: 400 }
      );
    }

    const solicitudId = existingSolicitud[0].id_solicitudes;
    const estadoSecciones = existingSolicitud[0].estado_secciones
      ? JSON.parse(existingSolicitud[0].estado_secciones)
      : {};

    console.log("Este es el estado de la seccion ", estadoSecciones);

    // Actualizamos la seccion (protocolo firma) a "completado" y desbloqueamos la siguiente (validacion)
    estadoSecciones.protocolo_firmas = "completado";

    // Actualiza la solicitud en la tabla solicitudes_convenios
    await connection.execute(
      "UPDATE solicitudes_convenios SET protocolo_firmas_id = ?, estado_solicitud = ?, estado_secciones = ? WHERE id_solicitudes = ?",
      [protocoloId, "Firma", JSON.stringify(estadoSecciones), solicitudId]
    );

    // Notificar al administrador que hay una nueva solicitud completa
    const [adminResult]: [any[], any] = await connection.execute(
      `SELECT id_usuario FROM usuario WHERE rol = 'administrador' LIMIT 1`
    );

    const adminId = adminResult[0]?.id_usuario;
    console.log("Esto es el adminID", adminId)

    if (adminId) {
      try {
        await connection.execute(
          `INSERT INTO notificaciones (usuario_id, solicitud_id, mensaje, tipo_notificacion, leido) VALUES (?, ?, ?, ?, ?)`,
          [
            adminId, // ID del administrador que recibirá la notificación
            solicitudId, // ID de la solicitud relacionada
            "Una nueva solicitud ha sido completada y está lista para revisión.", // Mensaje personalizado
            "Solicitud Completa", // Tipo de notificación
            false, // No leído
          ]
        );
        console.log("Notificación creada correctamente.");
      } catch (error: any) {
        console.error("Error al crear la notificación: ",error.message || error);
      }
    } else {
      console.log("No se encontró ningún administrador.");
    }

    await connection.commit();

    return NextResponse.json(
      {
        message:
          "Protocolo de firmas guardado con éxito y notificación enviada al administrador",
        data: protocoloResult,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await connection.rollback();
    console.error(
      "Error al guardar el protocolo de firmas:",
      error.message || error
    );
    return NextResponse.json(
      {
        message: "Error al guardar el protocolo de firmas",
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    connection.release(); // Devuelve la conexión al pool de conexiones
  }
}

export async function GET() {
  const connection = await connectDB();
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const usuarioId = session.user?.id;

    const [rows]: any = await connection.execute(
      "SELECT * FROM protocolo_firmas WHERE usuario_id = ?",
      [usuarioId]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching protocolo_firmas:", error.message || error);
    return NextResponse.json(
      { message: "Error fetching data", error: error.message || error },
      { status: 500 }
    );
  } finally {
    connection.release(); // Devuelve la conexión al pool de conexiones
  }
}

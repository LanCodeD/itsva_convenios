import { NextResponse } from 'next/server';
import { connectDB } from '@/libs/database';
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";

export async function PUT(
  request: Request,
  { params }: { params: { id_protocolo_firmas: string } }
) {
  const connection = await connectDB();
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const isAdmin = session.user?.role === "administrador";

    // Verificar si es administrador
    if (!isAdmin) {
      return NextResponse.json(
        { message: "No tienes permiso para realizar esta acción" },
        { status: 403 }
      );
    }

    // Obtener los datos enviados en la solicitud
    const { estado_validacion, requiere_protocolo, fecha_seleccionada } = await request.json();

    // Verificar si el registro de protocolo_firmas existe
    const [result]: [any[], any] = await connection.execute(
      "SELECT * FROM protocolo_firmas WHERE id_protocolo_firmas = ?",
      [params.id_protocolo_firmas]
    );

    const protocoloFirmas = result[0];

    if (!protocoloFirmas) {
      return NextResponse.json(
        { message: "Protocolo de firmas no encontrado" },
        { status: 404 }
      );
    }

    // Obtener la solicitud asociada en la tabla solicitudes_convenios
    const [solicitudResult]: [any[], any] = await connection.execute(
      "SELECT id_solicitudes, usuario_id, estado_secciones FROM solicitudes_convenios WHERE protocolo_firmas_id = ?",
      [params.id_protocolo_firmas]
    );

    const solicitud = solicitudResult[0];

    if (!solicitud) {
      return NextResponse.json(
        { message: "Solicitud asociada no encontrada" },
        { status: 404 }
      );
    }

    const solicitudId = solicitud.id_solicitudes;
    //const usuarioId = solicitud.usuario_id; // ID del usuario que recibirá la notificación
    const estadoSecciones = solicitud.estado_secciones
      ? JSON.parse(solicitud.estado_secciones)
      : {};

    // Construir la query de actualización dependiendo de los datos recibidos
    const fieldsToUpdate: { [key: string]: string } = {};

    // Agregar campos a actualizar si fueron enviados
    if (estado_validacion !== undefined) {
      fieldsToUpdate["estado_validacion"] = estado_validacion;
    }
    if (requiere_protocolo !== undefined) {
      fieldsToUpdate["requiere_protocolo"] = requiere_protocolo;
    }
    if (fecha_seleccionada !== undefined) {
      fieldsToUpdate["fecha_seleccionada"] = fecha_seleccionada;
    }

    // Actualizar estado_secciones para marcar la sección como "activo" si los datos están vacíos
    if (requiere_protocolo === "" || fecha_seleccionada === "") {
      estadoSecciones.protocolo_firmas = "activo"; // Cambiamos el estado a "activo"
      
      // Actualizar en la tabla solicitudes_convenios
      await connection.execute(
        "UPDATE solicitudes_convenios SET estado_secciones = ? WHERE id_solicitudes = ?",
        [JSON.stringify(estadoSecciones), solicitudId]
      );
    }

    // Verificar si hay campos para actualizar en la tabla protocolo_firmas
    if (Object.keys(fieldsToUpdate).length > 0) {
      // Generar la parte "SET" de la query dinámica
      const setClause = Object.keys(fieldsToUpdate)
        .map((field) => `${field} = ?`)
        .join(", ");
    
      const values = Object.values(fieldsToUpdate);

      // Ejecutar la query de actualización en protocolo_firmas
      await connection.execute(
        `UPDATE protocolo_firmas SET ${setClause} WHERE id_protocolo_firmas = ?`,
        [...values, params.id_protocolo_firmas]
      );
    }

    // Lógica para crear la notificación después de la actualización exitosa
/*     await connection.execute(
      `INSERT INTO notificaciones (usuario_id, solicitud_id, mensaje, tipo_notificacion, leido) VALUES (?, ?, ?, ?, ?)`,
      [
        usuarioId,  // ID del usuario que recibirá la notificación
        solicitudId,  // ID de la solicitud relacionada
        `El estado de 'Protocolo de Firmas' ha sido actualizado a ${estado_validacion || "Rechazado"}.`, // Mensaje personalizado
        'Protocolo Firmas', // Tipo de notificación
        false, // No leído
      ]
    );
 */
    return NextResponse.json(
      { message: "Protocolo de firmas y solicitud actualizados correctamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar el protocolo de firmas:", error.message || error);
    return NextResponse.json(
      {
        message: "Error al actualizar el protocolo de firmas",
        error: error.message || error,
      },
      { status: 500 }
    );
  } finally {
    connection.release(); // Devuelve la conexión al pool de conexiones
  }
}

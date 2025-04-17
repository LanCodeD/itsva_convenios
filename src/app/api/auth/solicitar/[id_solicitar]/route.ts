import { NextResponse } from 'next/server';
import { connectDB } from '@/libs/database';
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";

export async function PUT(
  request: Request,
  { params }: { params: { id_solicitar: string } }
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

    // Obtenemos los datos enviados en el cuerpo de la solicitud
    const { estado_validacion, nombre_solicitante, correo_solicitar, telefono, clave_matricula } = await request.json();

    // Verificar si la solicitud existe
    const [result]: [any[], any] = await connection.execute(
      "SELECT * FROM solicitar WHERE id_solicitar = ?",
      [params.id_solicitar]
    );

    const solicitud = result[0];

    if (!solicitud) {
      return NextResponse.json(
        { message: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    // Obtener la solicitud asociada en la tabla solicitudes_convenios
    const [solicitudResult]: [any[], any] = await connection.execute(
      "SELECT id_solicitudes, usuario_id FROM solicitudes_convenios WHERE solicitar_id = ?",
      [params.id_solicitar]
    );

    const solicitudConvenio = solicitudResult[0];

    if (!solicitudConvenio) {
      return NextResponse.json(
        { message: "Solicitud asociada no encontrada" },
        { status: 404 }
      );
    }

    const solicitudId = solicitudConvenio.id_solicitudes;
    const usuarioId = solicitudConvenio.usuario_id; // Obtener el usuario que recibirá la notificación
/*     const estadoSecciones = solicitudConvenio.estado_secciones 
      ? JSON.parse(solicitudConvenio.estado_secciones)
      : {}; */

    // Construir la query de actualización dependiendo de los datos recibidos
    const fieldsToUpdate: { [key: string]: string } = {};
    
    if (estado_validacion !== undefined) {
      fieldsToUpdate["estado_validacion"] = estado_validacion;
    }

    // Verificamos si otros campos fueron enviados (para el botón de limpiar datos)
    if (nombre_solicitante !== undefined) {
      fieldsToUpdate["nombre_solicitante"] = nombre_solicitante;
    }
    if (correo_solicitar !== undefined) {
      fieldsToUpdate["correo_solicitar"] = correo_solicitar;
    }
    if (telefono !== undefined) {
      fieldsToUpdate["telefono"] = telefono;
    }
    if (clave_matricula !== undefined) {
      fieldsToUpdate["clave_matricula"] = clave_matricula;
    }

    // Verificar si hay algún campo para actualizar
    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json(
        { message: "No se enviaron campos para actualizar" },
        { status: 400 }
      );
    }

    // Generar las partes de la query
    const setClause = Object.keys(fieldsToUpdate)
      .map((field) => `${field} = ?`)
      .join(", ");
    
    const values = Object.values(fieldsToUpdate);

    // Ejecutar la query de actualización
    await connection.execute(
      `UPDATE solicitar SET ${setClause} WHERE id_solicitar = ?`,
      [...values, params.id_solicitar]
    );

    // Lógica para crear la notificación después de la actualización exitosa
/*     await connection.execute(
      `INSERT INTO notificaciones (usuario_id, solicitud_id, mensaje, tipo_notificacion, leido) VALUES (?, ?, ?, ?, ?)`,
      [
        usuarioId,  // ID del usuario que recibirá la notificación
        solicitudId,  // ID de la solicitud relacionada
        `El estado de 'Solicitar' ha sido actualizado a ${estado_validacion || "Rechazado"}.`, // Mensaje personalizado
        'Solicitante', // Tipo de notificación
        false, // No leído
      ]
    ); */

    return NextResponse.json(
      { message: "Solicitud actualizadas correctamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar la solicitud:", error.message || error);
    return NextResponse.json(
      {
        message: "Error al actualizar la solicitud",
        error: error.message || error,
      },
      { status: 500 }
    );
  } finally {
    connection.release(); // Devuelve la conexión al pool de conexiones
  }
}


// app/api/subir_c/[id_subir_convenio]/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { connectDB } from "@/libs/database";
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";

// 0) Indicamos que esto corre en Node.js
export const runtime = 'nodejs';

export async function PUT(
  request: Request,
  { params }: { params: { id_subir_convenio: string } }
) {
  const connection = await connectDB();
  try {
    // 1) Autenticación y autorización
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const isAdmin = session.user?.role === "administrador";
    if (!isAdmin) {
      return NextResponse.json(
        { message: "No tienes permiso para realizar esta acción" },
        { status: 403 }
      );
    }

    // 2) Leer body
    const { estado_validacion, convenio_subir, fecha_subida } =
      await request.json();

    // 3) Recuperar registro de subir_convenio
    const [result]: [any[], any] = await connection.execute(
      "SELECT convenio_subir FROM subir_convenio WHERE id_subir_convenio = ?",
      [params.id_subir_convenio]
    );
    const subirConvenio = result[0];
    if (!subirConvenio) {
      return NextResponse.json(
        { message: "Registro de convenio no encontrado" },
        { status: 404 }
      );
    }

    // 4) Si lo están “limpiando” (convenio_subir === ""), borramos el fichero viejo
    if (convenio_subir === "") {
      const oldUrl: string = subirConvenio.convenio_subir;
      if (oldUrl) {
        // construye ruta absoluta
        const filePath = path.join(
          process.cwd(),
          "public",
          oldUrl.replace(/^\//, "")
        );
        try {
          await fs.unlink(filePath);
        } catch (err: any) {
          // ignora si ya no existe
          if (err.code !== "ENOENT") {
            console.error("Error borrando fichero viejo:", filePath, err);
          }
        }
      }
    }

    // 5) Recuperar datos para actualizar estado_secciones
    const [solicitudResult]: [any[], any] = await connection.execute(
      `SELECT id_solicitudes, usuario_id, estado_secciones 
         FROM solicitudes_convenios 
        WHERE subir_convenio_id = ?`,
      [params.id_subir_convenio]
    );
    const solicitud = solicitudResult[0];
    if (!solicitud) {
      return NextResponse.json(
        { message: "Solicitud asociada no encontrada" },
        { status: 404 }
      );
    }
    const solicitudId = solicitud.id_solicitudes;
    const usuarioId = solicitud.usuario_id;
    const estadoSecciones = solicitud.estado_secciones
      ? JSON.parse(solicitud.estado_secciones)
      : {};

    // Obtener la solicitud asociada en la tabla solicitudes_convenios
    const [nombreResult]: [any[], any] = await connection.execute(
      "SELECT nombre, apellido FROM usuario WHERE id_usuario = ?",
      [usuarioId]
    );

    const usuario = nombreResult[0];

    const nombreUsuario = usuario.nombre; // Obtener el usuario que recibirá la notificación
    const apellidoUsuario = usuario.apellido; // Obtener el usuario que recibirá la notificación

    // 6) Preparar campos a actualizar
    const fieldsToUpdate: { [key: string]: any } = {};
    if (estado_validacion !== undefined) {
      fieldsToUpdate.estado_validacion = estado_validacion;
    }
    if (convenio_subir !== undefined) {
      fieldsToUpdate.convenio_subir = convenio_subir;
    }
    if (fecha_subida !== undefined) {
      fieldsToUpdate.fecha_subida = fecha_subida === "" ? null : fecha_subida;
    }

    // 7) Si “limpian” convenio, desbloquean la sección otra vez
    if (convenio_subir === "" || fecha_subida === "") {
      estadoSecciones.subir_convenio = "activo";
      await connection.execute(
        "UPDATE solicitudes_convenios SET estado_secciones = ? WHERE id_solicitudes = ?",
        [JSON.stringify(estadoSecciones), solicitudId]
      );
    }

    // 8) Ejecutar UPDATE en subir_convenio
    if (Object.keys(fieldsToUpdate).length > 0) {
      const setClause = Object.keys(fieldsToUpdate)
        .map((f) => `${f} = ?`)
        .join(", ");
      const values = Object.values(fieldsToUpdate);
      await connection.execute(
        `UPDATE subir_convenio SET ${setClause} WHERE id_subir_convenio = ?`,
        [...values, params.id_subir_convenio]
      );
    }

    // 9) Insertar notificación para el solicitante
    // Lógica para crear la notificación después de la actualización exitosa
    await connection.execute(
      `INSERT INTO notificaciones (usuario_id, solicitud_id, mensaje, tipo_notificacion, leido) VALUES (?, ?, ?, ?, ?)`,
      [
        usuarioId,
        solicitudId,
        `
        Estimado(a) ${nombreUsuario || "Usuario"} ${
          apellidoUsuario || "Usuario"
        },<br><br>
    
        Tu solicitud ha sido revisada. Por favor, verifica el estado de las secciones:<br><br>
    
        - Solicitud inicial<br>
        - Subida de Convenio<br>
        - Protocolo de Firmas<br><br>
    
        Saludos, [Sistema de Convenios 2024]`,
        "Documento Revisado",
        false,
      ]
    );
    return NextResponse.json(
      { message: "Datos limpiados y fichero eliminado correctamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al limpiar convenio:", error.message || error);
    return NextResponse.json(
      {
        message: "Error al limpiar el convenio",
        error: error.message || error,
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id_solicitudes: string } } // Cambiamos el nombre del parámetro
) {
  const connection = await connectDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const usuarioId = session.user?.id;
    const { id_solicitudes } = params; // Ahora usamos id_solicitudes
    console.log("Este id pasa en el backend: ", id_solicitudes);

    // Verifica que el id_solicitudes sea válido
    if (!id_solicitudes) {
      return NextResponse.json(
        { message: "ID de solicitud no proporcionado" },
        { status: 400 }
      );
    }

    // PRIMERO: Recuperamos el id_subir_convenio a partir del id_solicitudes
    const [solicitudRows]: [any[], any] = await connection.execute(
      "SELECT subir_convenio_id FROM solicitudes_convenios WHERE id_solicitudes = ? AND usuario_id = ?",
      [id_solicitudes, usuarioId]
    );

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

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "No se encontró el convenio para este usuario y solicitud" },
        { status: 404 }
      );
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

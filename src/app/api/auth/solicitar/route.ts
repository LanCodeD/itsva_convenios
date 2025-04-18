import { NextResponse } from 'next/server';
import { connectDB } from '@/libs/database';
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";


export async function POST(request: Request) {
  const connection = await connectDB();
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Usuario no autenticado" }, { status: 401 });
    }

    const usuarioId = session.user?.id;
    const { nombre_solicitante, correo_solicitar, telefono, clave_matricula } = await request.json();
    const estadoValidacionInicial = "pendiente";

    await connection.beginTransaction();

    // Insertar la nueva solicitud en la tabla 'solicitar'
    const [solicitarResult]: any = await connection.execute(
      "INSERT INTO solicitar (nombre_solicitante, correo_solicitar, telefono, clave_matricula, usuario_id, estado_validacion) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre_solicitante, correo_solicitar, telefono, clave_matricula, usuarioId, estadoValidacionInicial]
    );

    const solicitarId = solicitarResult.insertId;
    
    // Buscar la solicitud activa (no completada) que aún no tenga un convenio asociado
    const [existingSolicitud]: any = await connection.execute(
      `SELECT id_solicitudes, estado_secciones FROM solicitudes_convenios WHERE usuario_id = ? AND solicitar_id IS NULL AND estado_solicitud = 'creando' ORDER BY id_solicitudes DESC LIMIT 1`,
      [usuarioId]
    );

    if (existingSolicitud.length === 0) {
      return NextResponse.json(
        {
          message: "No se ha encontrado ninguna solicitud pendiente para el usuario",
        },
        { status: 400 }
      );
    }

    const solicitudId = existingSolicitud[0].id_solicitudes;
    const estadoSecciones = existingSolicitud[0].estado_secciones ? JSON.parse(existingSolicitud[0].estado_secciones) : {};

    console.log("Este es el estado de la seccion ",estadoSecciones);
   // console.log("Valor actual de estado_secciones:", existingSolicitud[0].estado_secciones);

    // Actualizamos la primera sección (solicitar) a 'completado' y desbloqueamos la siguiente (subir_convenio)
    estadoSecciones.solicitar = 'completado';
    estadoSecciones.subir_convenio = 'desbloqueado'; // Desbloqueamos la siguiente sección

    // Actualizar la tabla solicitudes_convenios con el ID de la solicitud subido, cambiar el estado y el estado de las secciones
    await connection.execute(
      "UPDATE solicitudes_convenios SET solicitar_id = ?, estado_solicitud = ?, estado_secciones = ? WHERE id_solicitudes = ?",
      [solicitarId, "solicitar", JSON.stringify(estadoSecciones), solicitudId]
      
    );
    console.log("Actualizamos el solicitar", estadoSecciones)

    await connection.commit();

    return NextResponse.json(
      { message: "Solicitud subido con éxito", data: solicitarResult.insertId },
      { status: 201 }
    );

  } catch (error: any) {
    await connection.rollback();
    console.error("Error al crear la solicitud:", error.message || error);
    return NextResponse.json(
      { message: "Fallo al crear", error: error.message || error },
      { status: 500 }
    );
  } finally {
    connection.release(); // Devuelve la conexión al pool de conexiones
  }
}


export async function GET(request: Request) {
  const connection = await connectDB();
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener el id_solicitud de la query
    const { searchParams } = new URL(request.url);
    const id_solicitud = searchParams.get("id_solicitar");

    if (!id_solicitud) {
      return NextResponse.json({ message: "id_solicitud es requerido" }, { status: 400 });
    }

    const usuarioId = session.user?.id;

    // Obtener los detalles de la solicitud específica
    const [rows]: any = await connection.execute(
      'SELECT * FROM solicitar WHERE usuario_id = ? AND id_solicitar = ?',
      [usuarioId, id_solicitud]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Solicitud no encontrada" }, { status: 404 });
    }

    return NextResponse.json(rows[0]); // Devuelve el primer (y único) resultado
  } catch (error: any) {
    console.error("Error al obtener las solicitudes:", error.message || error);
    return NextResponse.json({ message: "Error al obtener los datos", error: error.message || error }, { status: 500 });
  } finally {
    connection.release(); // Devuelve la conexión al pool de conexiones
  }
}

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

    const { estado_validacion } = await request.json();

    if (!estado_validacion) {
      return NextResponse.json(
        { message: "estado_validacion es requerido" },
        { status: 400 }
      );
    }

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

    // Actualizar el estado de validación
    await connection.execute(
      "UPDATE solicitar SET estado_validacion = ? WHERE id_solicitar = ?",
      [estado_validacion, params.id_solicitar]
    );

    return NextResponse.json(
      { message: "Estado de validación actualizado correctamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar el estado de validación:", error.message || error);
    return NextResponse.json(
      {
        message: "Error al actualizar el estado de validación",
        error: error.message || error,
      },
      { status: 500 }
    );
  } finally {
    connection.release(); // Devuelve la conexión al pool de conexiones
  }
}
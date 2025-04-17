import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  const connection = await connectDB();
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const usuarioId = session.user?.id;

    // Primero, verificamos si el usuario tiene una solicitud pendiente
    const [pendingRequest]: any = await connection.execute(
      "SELECT id_solicitudes FROM solicitudes_convenios WHERE usuario_id = ? AND (protocolo_firmas_id IS NULL OR subir_convenio_id IS NULL OR solicitar_id IS NULL)",
      [usuarioId]
    );

    if (pendingRequest.length > 0) {
      // Si existe una solicitud pendiente, devolvemos un error
      return NextResponse.json(
        { message: "Tienes una solicitud pendiente por rellenar" },
        { status: 400 }
      );
    }

    // Si no hay solicitud pendiente, creamos una nueva
    const { estado_solicitud = "creando" } = await request.json();

    const [result]: any = await connection.execute(
      "INSERT INTO solicitudes_convenios (usuario_id, estado_solicitud) VALUES (?, ?)",
      [usuarioId, estado_solicitud]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Error al crear nueva solicitud" },
        { status: 500 }
      );
    }

    const newSolicitudId = result.insertId; // Obtener el ID de la nueva solicitud creada

    return NextResponse.json(
      {
        message: "Nueva solicitud creada exitosamente",
        solicitudId: newSolicitudId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "Error al crear nueva solicitud de convenio:",
      error.message || error
    );
    return NextResponse.json(
      {
        message: "Error al crear nueva solicitud de convenio",
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
  { params }: { params: { id_solicitud: string } }
) {
  console.log("ID de la solicitud recibido:", params.id_solicitud);

  const connection = await connectDB();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const usuarioId = session.user?.id;
    const isAdmin = session.user?.role === "administrador";

    let solicitud: any; // Aquí se almacenarán los datos de la solicitud general

    // Verificamos si es administrador
    if (isAdmin) {
      // Si es administrador, recuperamos la solicitud sin restricciones
      const [result]: [any[], any] = await connection.execute(
        "SELECT * FROM solicitudes_convenios WHERE id_solicitudes = ?",
        [params.id_solicitud]
      );
      solicitud = result[0];
      
    } else {
      // Si no es administrador, aplicamos la restricción del usuario_id
      const [result]: [any[], any] = await connection.execute(
        "SELECT * FROM solicitudes_convenios WHERE id_solicitudes = ? AND usuario_id = ?",
        [params.id_solicitud, usuarioId]
      );
      solicitud = result[0];
    }

    if (!solicitud) {
      return NextResponse.json(
        { message: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    console.log("Resultado de la solicitud:", solicitud);

    // Recuperar datos adicionales de "solicitar" usando la llave foránea
    const [solicitarResult]: [any[], any] = await connection.execute(
      "SELECT * FROM solicitar WHERE id_solicitar = ?",
      [solicitud.solicitar_id]
    );
    const solicitar = solicitarResult[0];
    console.log("Resultado de la id foránea solicitar:", solicitar);
    // Incluimos los datos de "solicitar" en la respuesta
    const fullData = {
      ...solicitud,
      solicitar: solicitar || null, // Si no hay datos en "solicitar", devuelve null
    };
    console.log("Resultado de full data: ", fullData);

    return NextResponse.json(fullData);
  } catch (error: any) {
    console.error("Error al obtener la solicitud:", error.message || error);
    return NextResponse.json(
      {
        message: "Error al obtener la solicitud",
        error: error.message || error,
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

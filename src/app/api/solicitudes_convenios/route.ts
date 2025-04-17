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
    
    const estadoSeccionesInicial = {
      solicitar: "activo",
      subir_convenio: "bloqueado",
      protocolo_firmas: "bloqueado"
    };
    
    const [result]: any = await connection.execute(
      "INSERT INTO solicitudes_convenios (usuario_id, estado_solicitud, estado_secciones) VALUES (?, ?, ?)",
      [usuarioId, estado_solicitud, JSON.stringify(estadoSeccionesInicial)]
    );
    console.log("Esto es el estado inicial",estadoSeccionesInicial);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Error al crear nueva solicitud" }, { status: 500 });
    }

    const newSolicitudId = result.insertId; // Obtener el ID de la nueva solicitud creada

    return NextResponse.json({ message: "Nueva solicitud creada exitosamente", solicitudId: newSolicitudId }, { status: 201 });

  } catch (error: any) {
    console.error("Error al crear nueva solicitud de convenio:", error.message || error);
    return NextResponse.json(
      { message: "Error al crear nueva solicitud de convenio", error: error.message || error },
      { status: 500 }
    );
  } finally {
    connection.release();
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
      'SELECT * FROM solicitudes_convenios WHERE usuario_id = ? ORDER BY fecha_creacion DESC',
      [usuarioId]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error al obtener solicitudes:", error.message || error);
    return NextResponse.json({ message: "Error al obtener solicitudes", error: error.message || error }, { status: 500 });
  } finally {
    connection.release();
  }
}
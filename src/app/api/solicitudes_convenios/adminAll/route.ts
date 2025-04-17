import { NextResponse } from 'next/server';
import { connectDB } from '@/libs/database';
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";

export async function GET() {
  const connection = await connectDB();
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Verificar si el usuario logueado es administrador
    const isAdmin = session.user?.role === 'administrador';
    
    if (!isAdmin) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    // Consultar la tabla solicitudes_convenios uniendo con la tabla usuario
    const [rows]: any = await connection.execute(
      `SELECT sc.id_solicitudes, sc.estado_solicitud, sc.fecha_creacion, sc.fecha_finalizacion, u.nombre, u.apellido, u.correo
       FROM solicitudes_convenios sc
       JOIN usuario u ON sc.usuario_id = u.id_usuario
       ORDER BY sc.fecha_creacion DESC`
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error al obtener solicitudes:", error.message || error);
    return NextResponse.json({ message: "Error al obtener solicitudes", error: error.message || error }, { status: 500 });
  } finally {
    connection.release();
  }
}

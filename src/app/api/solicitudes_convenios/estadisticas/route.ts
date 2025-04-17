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

    // Aseguramos que sea un administrador
    const usuarioRol = session.user?.role;
    if (usuarioRol !== 'administrador') {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
    }

    // Obtener estadísticas
    const [totalSolicitudes]: any = await connection.execute(
      'SELECT COUNT(*) AS total FROM solicitudes_convenios'
    );

    const [pendientesSolicitudes]: any = await connection.execute(
      'SELECT COUNT(*) AS pendientes FROM solicitudes_convenios WHERE fecha_finalizacion IS NULL'
    );

    const [finalizadasSolicitudes]: any = await connection.execute(
      'SELECT COUNT(*) AS finalizadas FROM solicitudes_convenios WHERE fecha_finalizacion IS NOT NULL'
    );

    // Retornamos las estadísticas en formato JSON
    return NextResponse.json({
      total: totalSolicitudes[0].total,
      pendientes: pendientesSolicitudes[0].pendientes,
      finalizadas: finalizadasSolicitudes[0].finalizadas,
    });
  } catch (error: any) {
    console.error("Error al obtener estadísticas:", error.message || error);
    return NextResponse.json({ message: "Error al obtener estadísticas", error: error.message || error }, { status: 500 });
  } finally {
    connection.release();
  }
}

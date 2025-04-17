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

    // Consultar la tabla usuario y perfil con un JOIN
    const [rows]: any = await connection.execute(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.rol, 
              p.informacion, p.ciudad, p.clave_o_matricula, p.numero_telefonico, p.foto_perfil 
       FROM usuario u
       LEFT JOIN perfil p ON u.perfil_id = p.id_perfil
       ORDER BY u.id_usuario DESC`
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error al obtener usuarios y perfiles:", error.message || error);
    return NextResponse.json({ message: "Error al obtener usuarios", error: error.message || error }, { status: 500 });
  } finally {
    connection.release();
  }
}

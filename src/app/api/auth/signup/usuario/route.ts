// Ruta: /api/usuarios/ranking.ts

import { connectDB } from "@/libs/database";

export async function GET(request: Request) {
  const connection = await connectDB();

  try {
    // Obtener usuarios ordenados por la cantidad de solicitudes creadas
    const [rankingUsuariosRows] = await connection.execute(`
      SELECT u.id_usuario, u.nombre, u.apellido, u.correo, p.foto_perfil, COUNT(s.id_solicitudes) as totalSolicitudes 
      FROM usuario u 
      LEFT JOIN solicitudes_convenios s ON u.id_usuario = s.usuario_id 
      LEFT JOIN perfil p ON u.perfil_id = p.id_perfil
      GROUP BY u.id_usuario 
      ORDER BY totalSolicitudes DESC
      LIMIT 10
    `);

    return new Response(JSON.stringify(rankingUsuariosRows), { status: 200 });
  } catch (error) {
    console.error("Error al obtener ranking de usuarios activos:", error);
    return new Response(JSON.stringify({ message: 'Error al obtener ranking' }), { status: 500 });
  } finally {
    connection.release();
  }
}

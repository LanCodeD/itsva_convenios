import { connectDB } from '@/libs/database';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/libs/authOptions";

export async function GET(req: Request) {
    const connection = await connectDB();
    try {
      const session = await getServerSession(authOptions);
  
      if (!session) {
        return new Response(JSON.stringify({ notificaciones: [] }), { status: 401 });
      }
  
      // Consulta para recuperar las notificaciones del usuario
      const [result]: [any[], any] = await connection.execute(
        'SELECT id_notificacion, mensaje, fecha_creacion, leido, solicitud_id FROM notificaciones WHERE usuario_id = ? ORDER BY fecha_creacion DESC',
        [session.user.id]
      );
  
      return new Response(JSON.stringify({ notificaciones: result }), { status: 200 });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return new Response(JSON.stringify({ notificaciones: [] }), { status: 500 });
    } finally {
      connection.release();
    }
  }
  

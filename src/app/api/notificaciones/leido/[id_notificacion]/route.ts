import { getServerSession } from 'next-auth';
import { connectDB } from '@/libs/database';
import { authOptions } from "@/libs/authOptions";

export async function PUT(req: Request, { params }: { params: { id_notificacion: string } }) {
    const { id_notificacion } = params;
    const connection = await connectDB();
    //console.log("El id que recibe el backend en notificacion: ", id_notificacion)
    try {
      const session = await getServerSession(authOptions);
  
      if (!session) {
        return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401 });
      }
  
      const { leido } = await req.json();
      //console.log("Esto es el valor de leido: ",leido)
  
      const [result]: [any[], any] = await connection.execute(
        'UPDATE notificaciones SET leido = ? WHERE id_notificacion = ? AND usuario_id = ?',
        [leido, id_notificacion, session.user.id]
      );
  
      if (result.length === 0) {
        return new Response(JSON.stringify({ message: 'Notificación no encontrada o no autorizada' }), { status: 404 });
      }
      
      return new Response(JSON.stringify({ message: 'Notificación marcada como leída' }), { status: 200 });
    } catch (error) {
      console.error('Error actualizando notificación:', error);
      return new Response(JSON.stringify({ message: 'Error interno del servidor' }), { status: 500 });
    } finally {
      connection.release();
    }
  }
  
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/libs/database';
import { authOptions } from "@/libs/authOptions";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
  
    const userId = session.user.id;
    const connection = await connectDB();
  
    try {
      const [rows]: [any[], any] = await connection.execute(
        'SELECT COUNT(*) as unreadCount FROM notificaciones WHERE usuario_id = ? AND leido = 0',
        [userId]
      );
  
      const unreadCount = rows[0]?.unreadCount || 0;
      return NextResponse.json({ unreadCount }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ message: 'Error al obtener las notificaciones no leídas', error: error.message }, { status: 500 });
    } finally {
      connection.release();
    }
  }
  

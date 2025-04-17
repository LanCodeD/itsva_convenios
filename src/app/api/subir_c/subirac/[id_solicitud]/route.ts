import { NextResponse } from 'next/server';
import { connectDB } from '@/libs/database';
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";

export async function GET(
  request: Request,
  { params }: { params: { id_solicitud: string } } // Cambiamos el nombre del parámetro
) {
  const connection = await connectDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const usuarioId = session.user?.id;
    const { id_solicitud } = params; // Ahora usamos id_solicitudes
    console.log("Este id pasa en el backend GET: ", id_solicitud);

    // Verifica que el id_solicitudes sea válido
    if (!id_solicitud) {
      return NextResponse.json(
        { message: "ID de solicitud no proporcionado" },
        { status: 400 }
      );
    }

    // PRIMERO: Recuperamos el id_subir_convenio a partir del id_solicitudes
    const [solicitudRows]: [any[], any] = await connection.execute(
      "SELECT subir_convenio_id FROM solicitudes_convenios WHERE id_solicitudes = ? AND usuario_id = ?",
      [id_solicitud, usuarioId]
    );

    if (!solicitudRows || solicitudRows.length === 0) {
      return NextResponse.json(
        { message: "No se encontró la solicitud para este usuario" },
        { status: 404 }
      );
    }

    const id_subir_convenio = solicitudRows[0].subir_convenio_id;

    // SEGUNDO: Ahora obtenemos los datos de la tabla subir_convenio usando id_subir_convenio
    const [rows]: [any[], any] = await connection.execute(
      "SELECT sub.convenio_subir, sub.estado_validacion, sub.fecha_subida FROM subir_convenio sub WHERE sub.id_subir_convenio = ?",
      [id_subir_convenio]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "No se encontró el convenio para este usuario y solicitud" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]); // Devuelve la primera fila encontrada
  } catch (error: any) {
    console.error("Error fetching convenio_solicitud:", error.message || error);
    return NextResponse.json(
      { message: "Error al obtener los datos", error: error.message || error },
      { status: 500 }
    );
  } finally {
    connection.release(); // Devuelve la conexión al pool de conexiones
  }
}

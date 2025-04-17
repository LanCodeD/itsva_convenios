import { NextResponse } from 'next/server';
import { connectDB } from '@/libs/database';
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";

export async function GET(
  request: Request,
  { params }: { params: { id_solicitudes: string } } // Cambiamos el nombre del parámetro
) {
  const connection = await connectDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const isAdmin = session.user?.role === "administrador";

    if (!isAdmin) {
      return NextResponse.json(
        { message: "No tienes permiso para realizar esta acción" },
        { status: 403 }
      );
    }

    
    const { id_solicitudes } = params; // Ahora usamos id_solicitudes
    console.log("Este id pasa en el backend: ", id_solicitudes);

    // Verifica que el id_solicitudes sea válido
    if (!id_solicitudes) {
      return NextResponse.json(
        { message: "ID de solicitud no proporcionado" },
        { status: 400 }
      );
    }

    // PRIMERO: Recuperamos el id_subir_convenio, solicitar_id y protocolo_firmas_id a partir del id_solicitudes
    const [solicitudRows]: [any[], any] = await connection.execute(
      "SELECT subir_convenio_id, solicitar_id, protocolo_firmas_id FROM solicitudes_convenios WHERE id_solicitudes = ?",
      [id_solicitudes]
    );

    if (!solicitudRows || solicitudRows.length === 0) {
      return NextResponse.json(
        { message: "No se encontró la solicitud para este usuario" },
        { status: 401 }
      );
    }

    const id_subir_convenio = solicitudRows[0].subir_convenio_id;
    const id_solicitar = solicitudRows[0].solicitar_id;
    const id_protocolo_firmas = solicitudRows[0].protocolo_firmas_id;

    // SEGUNDO: Obtenemos los datos de la tabla subir_convenio
    const [subirConvenioRows]: [any[], any] = await connection.execute(
      "SELECT estado_validacion FROM subir_convenio WHERE id_subir_convenio = ?",
      [id_subir_convenio]
    );

    if (!subirConvenioRows || subirConvenioRows.length === 0) {
      return NextResponse.json(
        { message: "No se encontró el convenio para esta solicitud" },
        { status: 402 }
      );
    }

    // TERCERO: Obtenemos los datos de la tabla solicitar
    const [solicitarRows]: [any[], any] = await connection.execute(
      "SELECT estado_validacion FROM solicitar WHERE id_solicitar = ?",
      [id_solicitar]
    );

    if (!solicitarRows || solicitarRows.length === 0) {
      return NextResponse.json(
        { message: "No se encontró la solicitud para esta solicitud" },
        { status: 403 }
      );
    }

    // CUARTO: Obtenemos los datos de la tabla protocolo_firmas
    const [firmaRows]: [any[], any] = await connection.execute(
      "SELECT estado_validacion FROM protocolo_firmas WHERE id_protocolo_firmas = ?",
      [id_protocolo_firmas]
    );

    if (!firmaRows || firmaRows.length === 0) {
      return NextResponse.json(
        { message: "No se encontró el protocolo de firmas para esta solicitud" },
        { status: 405 }
      );
    }

    // Combinamos los resultados en un solo objeto
    const resultado = {
      estado_validacion_subir_convenio: subirConvenioRows[0].estado_validacion,
      estado_validacion_solicitar: solicitarRows[0].estado_validacion,
      estado_validacion_protocolo_firmas: firmaRows[0].estado_validacion,
    };
    console.log("Esto devuelve el resultado para finalizar la solicitud", resultado)

    return NextResponse.json(resultado);
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

export async function PUT(
    request: Request,
    { params }: { params: { id_solicitudes: string } }
  ) {
    const connection = await connectDB();
  
    try {
      const session = await getServerSession(authOptions);
  
      if (!session) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
      }
  
      
      const { id_solicitudes } = params;
  
      // Verifica que el id_solicitudes sea válido
      if (!id_solicitudes) {
        return NextResponse.json(
          { message: "ID de solicitud no proporcionado" },
          { status: 400 }
        );
      }
  
      // TERCERO: Actualizamos la fecha_finalizacion
      const fechaFinalizacion = new Date().toISOString().slice(0, 19).replace('T', ' '); // Formato YYYY-MM-DD HH:MM:SS
  
      const [updateResult]: any = await connection.execute(
        "UPDATE solicitudes_convenios SET fecha_finalizacion = ? WHERE id_solicitudes = ?",
        [fechaFinalizacion, id_solicitudes]
      );
  
      if (updateResult.affectedRows === 0) {
        return NextResponse.json(
          { message: "Error al actualizar la fecha de finalización" },
          { status: 500 }
        );
      }
  
      return NextResponse.json({ message: "Solicitud finalizada correctamente", fecha_finalizacion: fechaFinalizacion });
  
    } catch (error: any) {
      console.error("Error finalizando la solicitud:", error.message || error);
      return NextResponse.json(
        { message: "Error al finalizar la solicitud", error: error.message || error },
        { status: 500 }
      );
    } finally {
      connection.release(); // Liberar la conexión al pool
    }
  }

export async function DELETE(
    request: Request,
    { params }: { params: { id_solicitudes: string } }
  ) {
    const connection = await connectDB();
  
    try {
      const session = await getServerSession(authOptions);
  
      // Verificar si el usuario tiene una sesión activa
      if (!session) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
      }
  
      const { id_solicitudes } = params;
  
      // Verificar si se proporcionó el ID de la solicitud
      if (!id_solicitudes) {
        return NextResponse.json(
          { message: "ID de solicitud no proporcionado" },
          { status: 400 }
        );
      }
  
      // Realizar la eliminación en la base de datos
      const [deleteResult]: any = await connection.execute(
        "DELETE FROM solicitudes_convenios WHERE id_solicitudes = ?",
        [id_solicitudes]
      );
  
      // Verificar si la eliminación fue exitosa
      if (deleteResult.affectedRows === 0) {
        return NextResponse.json(
          { message: "Solicitud no encontrada o no pudo eliminarse" },
          { status: 404 }
        );
      }
  
      // Retornar éxito si la solicitud fue eliminada
      return NextResponse.json(
        { message: "Solicitud eliminada exitosamente" },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error eliminando la solicitud:", error.message || error);
      return NextResponse.json(
        { message: "Error al eliminar la solicitud", error: error.message || error },
        { status: 500 }
      );
    } finally {
      connection.release(); // Liberar la conexión al pool
    }
  }
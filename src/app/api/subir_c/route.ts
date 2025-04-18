import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  const connection = await connectDB();
  console.log("Recibido un POST para registrar URL de convenio");

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const usuarioId = session.user?.id;

    // Obtener los datos JSON enviados en la solicitud (contendrá la URL del archivo y otros datos si es necesario)
    const { convenio_subir } = await request.json();

    if (!convenio_subir) {
      return NextResponse.json(
        { message: "No se ha proporcionado la URL del archivo" },
        { status: 400 }
      );
    }

    const fechaSubida = new Date();
    const estadoConvenioId = 1;

    await connection.beginTransaction();
    console.log("Comenzando la transacción en la base de datos");
    const estadoValidacionInicial = "pendiente";

    // Insertar el nuevo convenio en la tabla `subir_convenio`
    const [subirConvenioResult]: any = await connection.execute(
      "INSERT INTO subir_convenio (convenio_subir, fecha_subida, estado_convenio_id, usuario_id, estado_validacion) VALUES (?, ?, ?, ?, ?)",
      [convenio_subir, fechaSubida, estadoConvenioId, usuarioId, estadoValidacionInicial]
    );

    const subirConvenioId = subirConvenioResult.insertId;

    // Buscar la solicitud activa que aún no tenga un convenio asociado y esté en estado "solicitar" o "Firma"
    const [existingSolicitud]: any = await connection.execute(
      `SELECT id_solicitudes, estado_secciones FROM solicitudes_convenios 
      WHERE usuario_id = ? 
      AND subir_convenio_id IS NULL 
      AND estado_solicitud IN ('solicitar', 'Firma') 
      ORDER BY id_solicitudes DESC LIMIT 1`,
      [usuarioId]
    );

    if (existingSolicitud.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { message: "No se ha encontrado ninguna solicitud pendiente para el usuario" },
       
      );
    }

    const solicitudId = existingSolicitud[0].id_solicitudes;
    const estadoSecciones = existingSolicitud[0].estado_secciones
      ? JSON.parse(existingSolicitud[0].estado_secciones)
      : {};

    // Actualizamos la sección (subir_convenio) a 'completado' y desbloqueamos la siguiente sección (protocolo_firmas)
    estadoSecciones.subir_convenio = "completado";
    estadoSecciones.protocolo_firmas = "desbloqueado";

    // Actualizar la tabla solicitudes_convenios con el ID del convenio subido y el estado de las secciones
    await connection.execute(
      "UPDATE solicitudes_convenios SET subir_convenio_id = ?, estado_solicitud = ?, estado_secciones = ? WHERE id_solicitudes = ?",
      [subirConvenioId, "subir", JSON.stringify(estadoSecciones), solicitudId]
    );

    await connection.commit();

    return NextResponse.json(
      {
        message: "Convenio registrado con éxito",
        data: subirConvenioResult.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("Error al registrar convenio:", error);
    return NextResponse.json(
      { message: "Fallo al registrar el convenio" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}


//SELECT s.convenio_subir, s.fecha_subida FROM subir_convenio s JOIN solicitudes_convenios sc ON
//s.id_subir_convenio = sc.subir_convenio_id WHERE sc.id_solicitudes = ? ORDER BY sc.fecha_creacion AND sc.usuario_id = ? DESC LIMIT 1;
export async function GET(request: Request) {
  const connection = await connectDB();
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const usuarioId = session.user?.id;

    const [rows] = await connection.execute(
      "SELECT * FROM subir_convenio WHERE usuario_id = ? ORDER BY fecha_subida DESC LIMIT 1",
      [usuarioId]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching convenio_solicitud:", error.message || error);
    return NextResponse.json(
      { message: "Error fetching data", error: error.message || error },
      { status: 500 }
    );
  } finally {
    connection.release(); // Devuelve la conexión al pool de conexiones
  }
}

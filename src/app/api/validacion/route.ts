import { NextResponse } from 'next/server';
import { connectDB } from '@/libs/database';
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";
import { RowDataPacket } from 'mysql2/promise';

interface EstadoValidacionResult extends RowDataPacket {
  estado_validacion: string;
}

export async function GET(request: Request) {
  const connection = await connectDB();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const usuarioId = session.user?.id;

    // Obtener el id de solicitud del query parameter
    const url = new URL(request.url);
    const solicitudIdQuery = url.searchParams.get('id_solicitud');
    //console.log("Esto envía la solicitudidquery: ",solicitudIdQuery)

    let solicitudId;

    // Si se recibe un id_solicitud, se usa, sino obtenemos la solicitud más reciente
    if (solicitudIdQuery) {
      solicitudId = solicitudIdQuery;
    } else {
      // Obtenemos la solicitud activa o la más reciente
      const [solicitudActiva]: any = await connection.execute(
        "SELECT id_solicitudes FROM solicitudes_convenios WHERE usuario_id = ? ORDER BY fecha_creacion DESC LIMIT 1",
        [usuarioId]
      );

      if (solicitudActiva.length === 0) {
        return NextResponse.json({ message: "No se encontró ninguna solicitud activa" }, { status: 404 });
      }

      solicitudId = solicitudActiva[0].id_solicitudes;
    }

    // Hacemos las consultas con el id de la solicitud proporcionada o activa
    const [solicitar]: [EstadoValidacionResult[], any] = await connection.execute(
      'SELECT s.nombre_solicitante, s.estado_validacion, s.correo_solicitar, s.telefono, s.clave_matricula, s.id_solicitar FROM solicitar s JOIN solicitudes_convenios sc ON s.id_solicitar = sc.solicitar_id WHERE sc.id_solicitudes = ?',
      [solicitudId]
    );
    //console.log("Esto envía solicitar:", solicitar)
    const [subirConvenio]: [EstadoValidacionResult[], any] = await connection.execute(
      'SELECT sub.convenio_subir, sub.estado_validacion, sub.id_subir_convenio, sub.fecha_subida FROM subir_convenio sub JOIN solicitudes_convenios sc ON sub.id_subir_convenio = sc.subir_convenio_id WHERE sc.id_solicitudes = ?',
      [solicitudId]
    );

    const [protocoloFirmas]: [EstadoValidacionResult[], any] = await connection.execute(
      'SELECT pf.fecha_seleccionada, pf.estado_validacion, pf.id_protocolo_firmas, pf.requiere_protocolo, pf.fecha_creacion FROM protocolo_firmas pf JOIN solicitudes_convenios sc ON pf.id_protocolo_firmas = sc.protocolo_firmas_id WHERE sc.id_solicitudes = ?',
      [solicitudId]
    );

    return NextResponse.json({
      solicitar: solicitar.length > 0 ? { estado_validacion: solicitar[0].estado_validacion, correo_solicitar: solicitar[0].correo_solicitar, telefono: solicitar[0].telefono, clave_matricula: solicitar[0].clave_matricula, id_solicitar: solicitar[0].id_solicitar, nombre_solicitante: solicitar[0].nombre_solicitante } : null,
      subirConvenio: subirConvenio.length > 0 ? { estado_validacion: subirConvenio[0].estado_validacion, id_subir_convenio: subirConvenio[0].id_subir_convenio, fecha_subida: subirConvenio[0].fecha_subida, convenio_subir: subirConvenio[0].convenio_subir } : null,
      protocoloFirmas: protocoloFirmas.length > 0 ? { estado_validacion: protocoloFirmas[0].estado_validacion, id_protocolo_firmas: protocoloFirmas[0].id_protocolo_firmas, requiere_protocolo: protocoloFirmas[0].requiere_protocolo, fecha_creacion: protocoloFirmas[0].fecha_creacion, fecha_seleccionada: protocoloFirmas[0].fecha_seleccionada } : null,
    });

  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching data", error: error.message || error }, { status: 500 });
  } finally {
    connection.release();
  }
}

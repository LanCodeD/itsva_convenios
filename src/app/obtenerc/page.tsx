"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import SolicitudModal from "./SolicitudModal"; // Importamos el componente Modal
import Image from "next/image";

export interface Solicitud {
  id_solicitudes: number;
  fecha_finalizacion: string | null; // Acepta null si aún no ha sido finalizada
  fecha_creacion: string;
  solicitar_id: number;
  subir_convenio_id: number;
  protocolo_firmas_id: number;
}

const ConveniosSolicitados = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchSolicitudes = async () => {
        try {
          const response = await axios.get("/api/solicitudes_convenios");
          setSolicitudes(response.data);
          setLoading(false);
        } catch (error) {
          console.error("Error al obtener el historial de solicitudes", error);
          setLoading(false);
        }
      };

      fetchSolicitudes();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [session, status, router]);

  const openModal = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSolicitud(null);
  };

  if (loading) {
    return <p>Cargando solicitudes...</p>;
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);

    // Obtén la diferencia de tiempo entre UTC y la hora local
    const offset = date.getTimezoneOffset() * 60000;

    // Ajusta la fecha para compensar la diferencia de zona horaria
    const localDate = new Date(date.getTime() - offset);

    return localDate.toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      timeZone: "America/Mexico_City",
    });
  };

  const formatDatCre = (isoString: string) => {
    const date = new Date(isoString);

    return date.toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      timeZone: "America/Mexico_City", // Asegura que use la zona horaria correcta
    });
  };

  return (
    <div className="max-w-full w-full mx-auto bg-white shadow-lg rounded-lg p-6 mt-5 flex flex-col md:flex-row">
      {/* Sección del historial de solicitudes */}
      <div className="md:w-1/2 md:pr-2 overflow-y-auto max-h-[80vh]">
        <h2 className="text-2xl font-bold text-textHeader mb-6 text-center">
          Historial de Solicitudes
        </h2>
        <ul>
          {solicitudes.map((solicitud) => (
            <li
              key={solicitud.id_solicitudes}
              className="mb-5 p-6 bg-gray-50 rounded-lg border-l-8 border-t-8 border-t-gray-200 border-cyan-500 shadow-md transition-all duration-300 ease-in-out hover:shadow-lg transform hover:scale-95 animate-fade-in"
            >
              <p className="text-lg text-gray-900">
                <strong className="font-semibold text-textHeader">
                  Fecha de Creación:
                </strong>
                {formatDatCre(solicitud.fecha_creacion)}
              </p>
              <p className="text-lg text-gray-900">
                <strong className="font-semibold text-textHeader">
                  Fecha de Finalización:
                </strong>
                {solicitud.fecha_finalizacion ? (
                  formatDate(solicitud.fecha_finalizacion)
                ) : (
                  <span className="text-red-600">
                    Aún no se ha finalizado la Solicitud
                  </span>
                )}
              </p>

              {/* Condición para mostrar el mensaje solo si hay fecha de finalización */}
              {solicitud.fecha_finalizacion && (
                <p className="text-green-600 font-semibold mt-2">
                  El documento escaneado será remitido a su correo electrónico.
                </p>
              )}

              <button
                onClick={() => openModal(solicitud)}
                className="mt-4 px-4 py-2 bg-colorDorado text-white font-semibold rounded-lg hover:bg-yellow-500"
              >
                Ver detalles
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Sección para la imagen estática */}
      <div className="md:w-1/2 flex justify-center items-center mt-5 relative w-full h-screen rounded-xl max-h-[75vh]">
        <Image
          src="/resource/image/formu6.png"
          alt="Imagen De Historial"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain rounded-xl"
        />
      </div>

      {/* Modal para los detalles de la solicitud */}
      <SolicitudModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        solicitud={selectedSolicitud}
      />
    </div>
  );
};

export default ConveniosSolicitados;

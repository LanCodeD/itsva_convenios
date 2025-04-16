"use client";
import { Dialog } from '@headlessui/react';
import {useRouter} from "next/navigation";

type Solicitud = {
  id_solicitudes: number;
  estado_solicitud: string;
  fecha_creacion: string;
  fecha_finalizacion?: string; // Hacemos que sea opcional
};

type ModalProps = {
  solicitud: Solicitud | null;
  isOpen: boolean;
  onClose: () => void;
};

const Modal = ({ solicitud, isOpen, onClose }: ModalProps) => {
  const router = useRouter(); 

  const handleVerDetalles = () => {
    onClose();
    if (solicitud?.id_solicitudes) {
      router.push(`/convenios/solicitud/${solicitud.id_solicitudes}`);
    } else {
      console.error("ID de solicitud no disponible");
    }
  };

  const formatDatCre = (isoString: string) => {
    const date = new Date(isoString);
  
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      timeZone: 'America/Mexico_City' // Asegura que use la zona horaria correcta
    });
  };
  

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
  
    // Obtén la diferencia de tiempo entre UTC y la hora local
    const offset = date.getTimezoneOffset() * 60000;
  
    // Ajusta la fecha para compensar la diferencia de zona horaria
    const localDate = new Date(date.getTime() - offset);
  
    return localDate.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      timeZone: 'America/Mexico_City'
    });
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Fondo oscuro */}
      <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
  
      {/* Contenido del modal centrado */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-gray-100 shadow-lg">
          {/* Encabezado del modal */}
          <div className="bg-guinda rounded-t-lg p-4 text-textGrispalido text-center">
            <Dialog.Title className="text-2xl font-semibold">Detalles de la Solicitud</Dialog.Title>
          </div>
  
          {/* Contenido del modal */}
          <div className="p-8 text-lg text-[#333333] space-y-6">
            {solicitud ? (
              <>
                {/* Información General */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900 ">Información de la Solicitud</h3>
                  <p><strong>ID Solicitud:</strong> {solicitud.id_solicitudes}</p>
                  <p><strong>Creado:</strong> {formatDatCre(solicitud.fecha_creacion)}</p>
                  <p>
                    <strong>Finalizado:</strong>{' '}
                    {solicitud.fecha_finalizacion ? formatDate(solicitud.fecha_finalizacion) : 'No finalizada'}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">Cargando información...</p>
            )}
  
            {/* Botones */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={handleVerDetalles}
                className="bg-colorDorado text-white px-6 py-3 rounded-full hover:bg-yellow-500"
              >
                Ver solicitud completa
              </button>
              <button
                className="bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-colorGrisOscuro"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
  
};


export default Modal;

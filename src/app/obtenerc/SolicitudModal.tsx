"use client";
import { Dialog } from "@headlessui/react";
import { Solicitud } from "./page"; // Importamos el tipo de solicitud
import {useRouter} from "next/navigation";


interface SolicitudModalProps {
  isOpen: boolean;
  closeModal: () => void;
  solicitud: Solicitud | null; // Puede ser nulo si no hay solicitud seleccionada
}



const SolicitudModal: React.FC<SolicitudModalProps> = ({
  isOpen,
  closeModal,
  solicitud,
}) => {
const router = useRouter(); // Inicializar useRouter
  
if (!solicitud) return null;
if (!isOpen) return null;

const handleVerDetalles = () => {
  closeModal(); // Cierra el modal
  if (solicitud?.id_solicitudes) {
    router.push(`/convenios/solicitud/${solicitud.id_solicitudes}`);
  } else {
    console.error("ID de solicitud no disponible");
  }
};

return (
  <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
    {/* Fondo oscuro */}
    <div className="fixed inset-0 bg-black/25" aria-hidden="true" />

    {/* Contenido del modal centrado */}
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Dialog.Panel className="mx-auto max-w-sm w-full rounded-lg bg-gray-100 shadow-lg">
        {/* Encabezado del modal */}
        <div className="bg-guinda rounded-t-lg p-4 text-textGrispalido text-center">
          <Dialog.Title className="text-2xl font-semibold">Detalles de la Solicitud</Dialog.Title>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 text-lg text-[#333333] space-y-4">
          <p>
            <strong>Campo Solicitar:</strong> {solicitud.solicitar_id ? "Completado" : "No Completado"}
          </p>
          <p>
            <strong>Campo Subir Convenio:</strong> {solicitud.subir_convenio_id ? "Completado" : "No Completado"}
          </p>
          <p>
            <strong>Campo Protocolo de Firma:</strong> {solicitud.protocolo_firmas_id ? "Completado" : "No Completado"}
          </p>
        </div>

        {/* Botones */}
        <div className="px-6 pb-6 flex gap-4">
          <button
            onClick={handleVerDetalles}
            className="bg-colorDorado text-white px-6 py-3 rounded-full hover:bg-yellow-500"
          >
            Ver solicitud completa
          </button>
          <button
            onClick={closeModal}
            className="bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-colorGrisOscuro"
          >
            Cerrar
          </button>
        </div>
      </Dialog.Panel>
    </div>
  </Dialog>
);

};

export default SolicitudModal;

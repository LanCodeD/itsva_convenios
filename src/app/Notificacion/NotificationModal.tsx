"use client";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/navigation";

interface NotificacionModalProps {
  isOpen: boolean;
  closeModal: () => void;
  notificacion: {
    id_notificacion: number;
    mensaje: string;
    solicitud_id: number;
    fecha_creacion: string;
    leido: boolean;
  } | null;
  marcarLeida: (id_notificacion: number) => void;
}

const NotificacionModal: React.FC<NotificacionModalProps> = ({
  isOpen,
  closeModal,
  notificacion,
  marcarLeida,
}) => {
  const router = useRouter();

  if (!notificacion) return null;
  if (!isOpen) return null;

  const handleVerSolicitud = () => {
    closeModal(); // Cierra el modal
    if (notificacion?.solicitud_id) {
      // console.log("ID de la solicitud desde notificacion",notificacion.solicitud_id)
      // Marcamos la notificación como leída
      marcarLeida(notificacion.id_notificacion);

      // Redirigimos a la página de la solicitud relacionada
      router.push(`/convenios/solicitud/${notificacion.solicitud_id}`);
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
            <Dialog.Title className="text-2xl font-semibold">
              Notificación
            </Dialog.Title>
          </div>

          {/* Contenido del modal */}
          <div className="p-6 text-lg text-[#333333] space-y-4">
            <p>
              <strong>Mensaje:</strong>
            </p>
            <p dangerouslySetInnerHTML={{ __html: notificacion.mensaje }} />
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(notificacion.fecha_creacion).toLocaleString()}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              {notificacion.leido ? "Leído" : "No leído"}
            </p>
          </div>

          {/* Botones */}
          <div className="px-6 pb-6 flex gap-4">
            <button
              onClick={handleVerSolicitud}
              className="bg-colorDorado text-white px-6 py-3 rounded-full hover:bg-yellow-500"
            >
              Ver solicitud relacionada
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

export default NotificacionModal;

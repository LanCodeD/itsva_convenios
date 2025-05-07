"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import NotificacionModal from "./NotificationModal"; // Importamos el modal
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";


export interface Notification {
  id_notificacion: number;
  mensaje: string;
  fecha_creacion: string;
  solicitud_id: number;
  leido: boolean;
}

const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Obtener las notificaciones al cargar la página
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get("/api/notificaciones");
          setNotifications(response.data.notificaciones);
        } catch (error) {
          console.error("Error al obtener las notificaciones:", error);
        }
      };

      fetchNotifications();
    } else if (status === "unauthenticated") {
      // Redirigir si el usuario no está autenticado
      router.push("/login");
    }
  }, [session, status, router]);

  // Manejar la apertura del modal y seleccionar la notificación
  const handleOpenModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const marcarLeida = async (id_notificacion: number) => {
    try {
      const response = await axios.put(
        `/api/notificaciones/leido/${id_notificacion}`,
        { leido: true } // Aquí agregamos el cuerpo JSON
      );
      //console.log("Respuesta de la API:", response);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id_notificacion === id_notificacion
            ? { ...notif, leido: true }
            : notif
        )
      );
    } catch (error) {
      console.error("Error al marcar la notificación como leída:", error);
    }
  };

  return (
    <div className="max-w-full w-full mx-auto bg-white shadow-lg rounded-lg p-6 mt-5 flex flex-col md:flex-row">
      <div className="md:w-1/2 md:pr-2 overflow-y-auto max-h-[80vh]">
        <h1 className="text-3xl font-bold mb-6 text-center text-textHeader">
          Notificaciones
        </h1>
        {notifications.length > 0 ? (
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li
                key={notification.id_notificacion}
                className={`p-4 rounded-lg shadow-md border-l-8 border-t-8 border-t-gray-200 cursor-pointer transition-transform transform hover:scale-95 animate-fade-in ${
                  notification.leido
                    ? "border-borderHeader bg-gray-50"
                    : "border-cyan-500 bg-white"
                }`}
                onClick={() => handleOpenModal(notification)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold">
                      {notification.leido ? (
                        <span className="text-textHeader">
                          Notificación Leída
                        </span>
                      ) : (
                        <span className="text-cyan-600">
                          Nueva Notificación
                        </span>
                      )}
                    </p>
                    <p className="text-gray-600">
                      {new Date(notification.fecha_creacion).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(notification);
                    }}
                    className="mt-4 px-4 py-2 bg-colorDorado text-white font-semibold rounded-lg hover:bg-yellow-500"
                  >
                    Ver detalles
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No hay notificaciones.</p>
        )}
      </div>
      <div className="md:w-1/2 flex justify-center items-center mt-5 relative w-full h-screen rounded-xl max-h-[75vh] ">
        <Image
          src="/resource/image/formu8.png"
          alt="Imagen De Historial"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain rounded-xl"
        />
      </div>

      {/* Modal de notificaciones */}
      {selectedNotification && (
        <NotificacionModal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          notificacion={selectedNotification}
          marcarLeida={marcarLeida}
        />
      )}
    </div>
  );
};

export default NotificationsComponent;

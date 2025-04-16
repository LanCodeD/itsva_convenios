// NotificationIcon.tsx
import React, { useEffect } from "react";
import useSWR from "swr";
import axios from "axios";

// Definimos el fetcher para SWR
const fetcher = (url: string) => axios.get(url).then(res => res.data);

interface NotificationIconProps {
  hasUnread: boolean; // Indica si hay notificaciones no leídas
  onRead: () => void;  // Función que se llama cuando se lean las notificaciones
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ hasUnread, onRead }) => {
  // SWR se encarga de la caché y las llamadas
  const { data, error } = useSWR("/api/notificaciones/noleido", fetcher);
  
  // Si aún no tenemos datos, unreadCount será 0 por defecto
  const unreadCount = data ? data.unreadCount : 0;

  // Efecto para llamar a onRead cuando no hay notificaciones no leídas
  useEffect(() => {
    if (unreadCount === 0 && hasUnread) {
      onRead(); // Notifica al componente padre que se han leído las notificaciones
    }
  }, [unreadCount, hasUnread, onRead]);

  // Manejo de errores
  if (error) {
    console.error("Error al obtener las notificaciones no leídas:", error);
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button className="icon-button">
        <i className="fas fa-bell ring-white"></i>

        {/* Muestra el indicador de notificaciones no leídas */}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-12px",
              right: "-7px",
              backgroundColor: "red",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "12px",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationIcon;

import { Dialog } from "@headlessui/react";
import { useState } from "react";
import axios from "axios"; // Asegúrate de tener Axios para hacer la petición al backend

type FirmaDetailsType = {
  id_protocolo_firmas: number;
  requiere_protocolo: boolean;
  fecha_seleccionada: string;
  fecha_creacion: string;
  estado_validacion: string;
};

type FirmaDetailsModalProps = {
  details: FirmaDetailsType | null; // Pasar los detalles como prop
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDetails: FirmaDetailsType) => void; // Ajustar para aceptar los detalles actualizados
};

export default function FirmaDetailsModal({
  details,
  isOpen,
  onClose,
  onSave,
}: FirmaDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(details?.estado_validacion || "Pendiente");

  const handleClearData = async () => {
    if (!details) return;
  
    try {
      await axios.put(`/api/protocolo_firmas/${details.id_protocolo_firmas}`, {
        requiere_protocolo: false,
        fecha_seleccionada: "",
        estado_validacion: "Rechazado",
      });

      setSelectedStatus("Rechazado");
      const updatedDetails = {
        ...details,
        requiere_protocolo: false,
        fecha_seleccionada: "",
        estado_validacion: "Rechazado",
      };
      onSave(updatedDetails);
      onClose();
    } catch (error) {
      console.error("Error al limpiar los datos del solicitante:", error);
    }
  };

  const handleUpdateValidationStatus = async () => {
    if (!details) return;

    try {
      await axios.put(`/api/protocolo_firmas/${details.id_protocolo_firmas}`, {
        estado_validacion: selectedStatus,
      });

      const updatedDetails = {
        ...details,
        estado_validacion: selectedStatus,
      };
      onSave(updatedDetails);
      onClose();

    } catch (error) {
      console.error("Error al actualizar el estado de validación:", error);
    }
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
      timeZone: "America/Mexico_City",
    });
  };

  const formatDat = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Mexico_City",
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Fondo oscuro que cubre toda la pantalla */}
      <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
  
      {/* Contenido del modal centrado */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Contenedor del contenido del modal */}
        <Dialog.Panel className="mx-auto max-w-lg w-full max-h-[80vh] overflow-y-auto rounded-lg bg-gray-100 shadow-lg">
          
          {/* Encabezado del modal */}
          <div className="bg-guinda rounded-t-lg p-4 text-textGrispalido text-center">
            <Dialog.Title className="text-2xl font-semibold">Detalles del Solicitante</Dialog.Title>
          </div>
  
          {/* Contenido del modal */}
          <div className="p-6 text-lg text-[#333333] space-y-6">
            {details ? (
              <>
                <div className="space-y-4">
                  <p><strong>Requiere Protocolo:</strong> {details.requiere_protocolo ? "Sí" : "No"}</p>
                  <p><strong>Fecha Seleccionada: </strong> 
                    {details.requiere_protocolo ? formatDat(details.fecha_seleccionada) : "No Requiere Fecha de Firma"}
                  </p>
                  <p><strong>Fecha de Creación:</strong> {formatDatCre(details.fecha_creacion)}</p>
                  <p><strong>Estado de Validación:</strong> {details.estado_validacion}</p>
                </div>
  
                {/* Dropdown para cambiar el estado de validación */}
                <div className="mt-4 space-y-2">
                  <label className="text-gray-900 font-medium">Cambiar Estado de Validación</label>
                  <select
                    className="border rounded-md px-4 py-2 mt-2 w-full bg-white text-gray-800"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aceptado">Aceptado</option>
                    {/* <option value="Rechazado">Rechazado</option> */}
                  </select>
                </div>
  
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleClearData}
                    className="bg-red-700 text-white px-4 py-2 rounded-full hover:bg-red-800"
                  >
                    Limpiar datos
                  </button>
  
                  <button
                    onClick={handleUpdateValidationStatus}
                    className="bg-colorDorado text-white px-6 py-2 rounded-full hover:bg-yellow-500"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">No hay detalles disponibles</p>
            )}
          </div>
  
          {/* Botón de cierre */}
          <div className="mt-4 flex justify-end p-4 bg-gray-200 rounded-b-lg">
            <button
              className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-colorGrisOscuro"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
  
}

import { Dialog } from "@headlessui/react";
import { useState } from "react";
import axios from "axios"; // Asegúrate de tener Axios para hacer la petición al backend

type SubirDetailsType = {
  id_subir_convenio: number;
  convenio_subir: string;
  fecha_subida: string;
  estado_validacion: string;
};

type SubirDetailsModalProps = {
  details: SubirDetailsType | null; // Pasar los detalles como prop
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDetails: SubirDetailsType) => void; // Ajustar para aceptar los detalles actualizados
};

export default function SubirDetailsModal({
  details,
  isOpen,
  onClose,
  onSave,
}: SubirDetailsModalProps) {
  // Estado para manejar el estado de validación seleccionado
  const [selectedStatus, setSelectedStatus] = useState(
    details?.estado_validacion || "Pendiente"
  );

  // Función para limpiar los datos del solicitante
  const handleClearData = async () => {
    if (!details) return;

    try {
      // Hacemos la petición al backend para limpiar los datos del solicitante
      await axios.put(`/api/subir_c/${details.id_subir_convenio}`, {
        convenio_subir: "",
        fecha_subida: "",
        estado_validacion: "Rechazado", // Cambiamos el estado a "Rechazado"
      });

      //console.log("Datos del solicitante limpiados correctamente");

      // Actualizar el estado local para reflejar los cambios en la UI
      setSelectedStatus("Rechazado");
      const updatedDetails = {
        ...details,
        convenio_subir: "",
        fecha_subida: "",
        estado_validacion: "Rechazado",
      };
      onSave(updatedDetails); // Pasar los detalles actualizados
      onClose(); // Cerrar modal después de actualizar
    } catch (error) {
      console.error("Error al limpiar los datos del solicitante:", error);
    }
  };

  // Función para actualizar el estado de validación
  const handleUpdateValidationStatus = async () => {
    if (!details) return;

    try {
      // Hacemos la petición al backend para actualizar el estado de validación
      await axios.put(`/api/subir_c/${details.id_subir_convenio}`, {
        estado_validacion: selectedStatus,
      });

      // Mostrar notificación o realizar alguna acción (como cerrar el modal)
      //console.log("Estado de validación actualizado:", selectedStatus);

      const updatedDetails = {
        ...details,
        estado_validacion: selectedStatus,
      };
      onSave(updatedDetails); // Pasar los detalles actualizados
      onClose(); // Cerrar modal después de actualizar
    } catch (error) {
      console.error("Error al actualizar el estado de validación:", error);
      // Manejar el error, mostrar notificación si es necesario
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
      timeZone: "America/Mexico_City", // Asegura que use la zona horaria correcta
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
                  <p><strong>Convenio Subido:</strong></p>
                  {details.convenio_subir ? (
                    details.convenio_subir.endsWith(".pdf") ? (
                      <iframe
                        src={details.convenio_subir}
                        title="Vista previa del PDF"
                        width="100%"
                        height="400px"
                        className="border rounded"
                      ></iframe>
                    ) : (
                      <a
                        href={details.convenio_subir}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Descargar archivo
                      </a>
                    )
                  ) : (
                    <p className="text-gray-500">No hay archivo subido</p>
                  )}
  
                  <p><strong>Fecha Subida:</strong> {formatDatCre(details.fecha_subida)}</p>
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

import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";
import axios from "axios"; // Asegúrate de tener Axios para hacer la petición al backend

type SolicitarDetailsType = {
  id_solicitar: number;
  nombre_solicitante: string;
  correo_solicitar: string;
  telefono: string;
  clave_matricula?: string;
  estado_validacion: string;
};

type SolicitarDetailsModalProps = {
  details: SolicitarDetailsType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDetails: SolicitarDetailsType) => void; // Ajustar para aceptar los detalles actualizados
};

export default function SolicitarDetailsModal({
  details,
  isOpen,
  onClose,
  onSave, // Acepta los detalles actualizados como argumento
}: SolicitarDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(details?.estado_validacion || "Pendiente");


  const handleClearData = async () => {
    if (!details) return;

    try {
      await axios.put(`/api/auth/solicitar/${details.id_solicitar}`, {
        nombre_solicitante: "",
        correo_solicitar: "",
        telefono: "",
        clave_matricula: "",
        estado_validacion: "Rechazado",
      });

      //console.log("Datos del solicitante limpiados correctamente");
      const updatedDetails = {
        ...details,
        nombre_solicitante: "",
        correo_solicitar: "",
        telefono: "",
        clave_matricula: "",
        estado_validacion: "Rechazado",
      };
      onSave(updatedDetails); // Pasar los detalles actualizados
      onClose();
    } catch (error) {
      console.error("Error al limpiar los datos del solicitante:", error);
    }
  };

  const handleUpdateValidationStatus = async () => {
    if (!details) return;

    try {
      await axios.put(`/api/auth/solicitar/${details.id_solicitar}`, {
        estado_validacion: selectedStatus,
      });

      //console.log("Estado de validación actualizado:", selectedStatus);
      const updatedDetails = {
        ...details,
        estado_validacion: selectedStatus,
      };
      onSave(updatedDetails); // Pasar los detalles actualizados
      onClose();
    } catch (error) {
      console.error("Error al actualizar el estado de validación:", error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
  
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-gray-100 shadow-lg">
          
          {/* Encabezado del modal */}
          <div className="bg-guinda rounded-t-lg p-4 text-textGrispalido text-center">
            <Dialog.Title className="text-2xl font-semibold">Detalles del Solicitante</Dialog.Title>
          </div>
  
          {/* Contenido del modal */}
          <div className="p-6 text-lg text-[#333333] space-y-6">
            {details ? (
              <>
                <div className="space-y-2">
                  <p><strong>Nombre Solicitante:</strong> {details.nombre_solicitante}</p>
                  <p><strong>Correo:</strong> {details.correo_solicitar}</p>
                  <p><strong>Teléfono:</strong> {details.telefono}</p>
                  <p><strong>Clave Matrícula:</strong> {details.clave_matricula
                  ? (details.clave_matricula)
                  : <span>No se requiere</span>}</p>
                  <p><strong>Estado de Validación:</strong> {details.estado_validacion}</p>
                </div>
  
                <div className="space-y-2 mt-4">
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
{/*                   <button
                    onClick={handleClearData}
                    className="bg-red-700 text-white px-4 py-2 rounded-full hover:bg-red-800 cursor-not-allowed"
                    
                  >
                    Limpiar datos
                  </button>
   */}
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

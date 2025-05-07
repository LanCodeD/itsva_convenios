import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import SolicitarDetailsModal from "./solicitud/[id_solicitud]/adminModal"; // Importa el modal
import SubirDetailsModal from "@/app/admin/GestionConvenio/modalEstado/modalArchivo";
import FirmaDetailsModal from "@/app/admin/GestionConvenio/modalEstado/modalFirma";
import { Icon } from "@iconify/react";

type ValidationStatusType = {
  solicitar: {
    id_solicitar: number;
    estado_validacion: string;
    nombre_solicitante: string;
    correo_solicitar: string;
    telefono: string;
    clave_matricula?: string;
  } | null;
  subirConvenio: {
    id_subir_convenio: number;
    convenio_subir: string;
    fecha_subida: string;
    estado_validacion: string;
  } | null;
  protocoloFirmas: {
    id_protocolo_firmas: number;
    requiere_protocolo: boolean;
    fecha_seleccionada: string;
    fecha_creacion: string;
    estado_validacion: string;
  } | null;
};

export default function ValidationStatus({
  isNewRequest,
  isRecoveryRequest,
  isAdmin, // Nueva prop para identificar si el usuario es administrador
}: {
  isNewRequest: boolean;
  isRecoveryRequest: boolean;
  isAdmin: boolean;
}) {
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id_solicitud } = useParams();

  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenSubir, setIsModalOpenSubir] = useState(false);
  const [isModalOpenFirma, setIsModalOpenFirma] = useState(false);
  const [selectedSolicitarDetails, setSelectedSolicitarDetails] = useState<
    ValidationStatusType["solicitar"] | null
  >(null);
  const [selectedSubirDetails, setSelectedSubirDetails] = useState<
    ValidationStatusType["subirConvenio"] | null
  >(null);
  const [selectedFirmaDetails, setSelectedFirmaDetails] = useState<
    ValidationStatusType["protocoloFirmas"] | null
  >(null);

  // Obtener el estado de validación desde el servidor
  useEffect(() => {
    const fetchValidationStatus = async () => {
      setLoading(true);
      try {
        const response = await axios.get<ValidationStatusType>(
          `/api/validacion?id_solicitud=${id_solicitud}`
        );
        setValidationStatus(response.data);
        //console.log("Esto retorna validacion response: ",response.data)
      } catch (error) {
        setError(
          (error as Error).message || "Error al obtener el estado de validación"
        );
      } finally {
        setLoading(false);
      }
    };

    // Si es una nueva solicitud o una solicitud recuperada, limpia los datos y obtén nueva información
    if (isNewRequest || isRecoveryRequest) {
      setValidationStatus(null); // Limpia los datos anteriores
      fetchValidationStatus(); // Obtén los nuevos datos de la solicitud
    } else {
      // Si es una solicitud desde el historial, solo carga los datos
      fetchValidationStatus(); // Llama siempre para cargar los datos cuando no es nueva solicitud
    }
  }, [isNewRequest, isRecoveryRequest, id_solicitud]);

  // Funciones auxiliares para manejo de archivos
  const getFileName = (url: string) => {
    const parts = url.split("/");
    return decodeURIComponent(parts[parts.length - 1]);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (extension === "pdf") return "📄";
    if (extension === "doc" || extension === "docx") return "📄";
    return "📁";
  };

  // Mostrar el contenido en la UI
  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // Mostrar mensaje cuando se está iniciando una nueva solicitud o se recupera una solicitud
  if ((isNewRequest || isRecoveryRequest) && !validationStatus) {
    return <div>Iniciando una nueva solicitud...</div>;
  }

  // Mostrar mensaje cuando no hay información de validación
  if (!validationStatus) {
    return <div>No se encontró información de validación</div>;
  }

  const handleOpenModal = (details: ValidationStatusType["solicitar"]) => {
    setSelectedSolicitarDetails(details);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSolicitarDetails(null);
  };

  const handleOpenModalSubir = (
    details: ValidationStatusType["subirConvenio"]
  ) => {
    setSelectedSubirDetails(details);
    setIsModalOpenSubir(true);
  };

  const handleCloseModalSubir = () => {
    setIsModalOpenSubir(false);
    setSelectedSubirDetails(null);
  };

  const handleOpenModalFirma = (
    details: ValidationStatusType["protocoloFirmas"]
  ) => {
    setSelectedFirmaDetails(details);
    setIsModalOpenFirma(true);
  };

  const handleCloseModalFirma = () => {
    setIsModalOpenFirma(false);
    setSelectedFirmaDetails(null);
  };

  const handleModalCloseWithUpdate = (
    updatedDetails: ValidationStatusType["solicitar"]
  ) => {
    if (validationStatus) {
      setValidationStatus({
        ...validationStatus,
        solicitar: updatedDetails, // Actualizas el campo correspondiente con los nuevos detalles
      });
    }
  };

  const handleModalCloseWithUpdateSubir = (
    updatedDetails: ValidationStatusType["subirConvenio"]
  ) => {
    if (validationStatus) {
      setValidationStatus({
        ...validationStatus,
        subirConvenio: updatedDetails,
      });
    }
  };

  const handleModalCloseWithUpdateFirma = (
    updatedDetails: ValidationStatusType["protocoloFirmas"]
  ) => {
    if (validationStatus) {
      setValidationStatus({
        ...validationStatus,
        protocoloFirmas: updatedDetails,
      });
    }
  };

  // Mostrar la tabla con los datos de validación
  return (
    <div className="bg-white pt-5 flex justify-center pb-16 rounded-xl">
      <div className="bg-white rounded-md p-6 max-w-full w-full h-full mx-auto">
        <table className="min-w-full bg-blue-50 rounded-lg">
          <thead>
            <tr className="bg-colorDorado text-textGrispalido">
              <th className="py-3 px-5 text-xl font-semibold text-center">
                Campo
              </th>
              <th className="py-3 px-5 text-xl font-semibold text-center">
                Sección
              </th>
              <th className="py-3 px-5 text-xl font-semibold text-center">
                Estado
              </th>
              {isAdmin && (
                <th className="py-3 px-5 text-xl font-semibold text-center">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="bg-white hover:bg-gray-100">
              <td className="py-4 px-5 text-xl text-center text-black">
                Solicitante
              </td>
              <td className="py-4 px-5 text-xl text-center text-black">
                {validationStatus.solicitar?.nombre_solicitante ||
                  "En espera..."}
              </td>
              <td className="px-4 py-4">
              <div className="flex justify-center items-center">
                {validationStatus.solicitar === null ? (
                  <span className="py-4 px-5 text-xl text-center text-gray-500">No registrado</span>
                ) : validationStatus.solicitar.estado_validacion ===
                  "Aceptado" ? (
                  <span className="flex items-center text-green-600 font-medium">
                    <Icon
                      icon="lucide:check"
                      width="24"
                      height="24"
                      className="mr-2"
                    />
                    Aceptado
                  </span>
                ) : validationStatus.solicitar.estado_validacion ===
                  "Rechazado" ? (
                  <span className="flex items-center text-red-600 font-medium">
                    <Icon
                      icon="mdi:close"
                      width="24"
                      height="24"
                      className="mr-2"
                    />
                    Rechazado
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-600 font-medium">
                    <Icon
                      icon="lucide:clock"
                      width="24"
                      height="24"
                      className="mr-2"
                    />
                    Pendiente
                  </span>
                )}
                </div>
              </td>
              {isAdmin && (
                <td className="py-4 px-5 text-xl text-center flex items-center justify-center">
                  <button
                    className="text-blue-600 hover:text-blue-400"
                    onClick={() => handleOpenModal(validationStatus.solicitar)}
                  >
                    <Icon icon="lucide:captions" width="28" height="28" />
                  </button>
                </td>
              )}
            </tr>
            <tr className="bg-white hover:bg-gray-100">
              <td className="py-4 px-5 text-xl text-center text-black">
                Documento Enviado
              </td>
              <td className="py-4 px-5 text-xl text-center">
                {validationStatus.subirConvenio?.convenio_subir ? (
                  <>
                    <span>
                      {getFileIcon(
                        getFileName(
                          validationStatus.subirConvenio.convenio_subir
                        )
                      )}
                    </span>
                    <a
                      href={validationStatus.subirConvenio.convenio_subir}
                      download={getFileName(
                        validationStatus.subirConvenio.convenio_subir
                      )}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getFileName(
                        validationStatus.subirConvenio.convenio_subir
                      )}
                    </a>
                  </>
                ) : (
                  "En espera..."
                )}
              </td>
              <td className="px-4 py-4">
              <div className="flex justify-center items-center">
                {validationStatus.subirConvenio === null ? (
                  <span className="py-4 px-5 text-xl text-center text-gray-500">No registrado</span>
                ) : validationStatus.subirConvenio.estado_validacion ===
                  "Aceptado" ? (
                  <span className="flex items-center text-green-600 font-medium">
                    <Icon
                      icon="lucide:check"
                      width="24"
                      height="24"
                      className="mr-2"
                    />
                    Aceptado
                  </span>
                ) : validationStatus.subirConvenio.estado_validacion ===
                  "Rechazado" ? (
                  <span className="flex items-center text-red-600 font-medium">
                    <Icon
                      icon="mdi:close"
                      width="24"
                      height="24"
                      className="mr-2"
                    />
                    Rechazado
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-600 font-medium">
                    <Icon
                      icon="lucide:clock"
                      width="24"
                      height="24"
                      className="mr-2"
                    />
                    Pendiente
                  </span>
                )}
                </div>
              </td>
              {isAdmin && (
               <td className="py-4 px-5 text-xl text-center flex items-center justify-center">
                  <button
                    className="text-blue-600 hover:text-blue-400"
                    onClick={() =>
                      handleOpenModalSubir(validationStatus.subirConvenio)
                    }
                  >
                   <Icon icon="lucide:captions" width="28" height="28" />
                  </button>
                </td>
              )}
            </tr>
            <tr className="bg-white hover:bg-gray-100">
              <td className="py-4 px-5 text-xl text-center text-black">
                Protocolo de Firma
              </td>
              <td className="py-4 px-5 text-xl text-center">
                {validationStatus.protocoloFirmas?.fecha_seleccionada
                  ? new Date(
                      validationStatus.protocoloFirmas.fecha_seleccionada
                    ).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : "No requiere firma"}
              </td>
              <td className="px-4 py-4">
              <div className="flex justify-center items-center">
                {validationStatus.protocoloFirmas === null ? (
                  <span className="py-4 px-5 text-xl text-center text-gray-500">No registrado</span>
                ) : validationStatus.protocoloFirmas.estado_validacion ===
                  "Aceptado" ? (
                  <span className="flex items-center text-green-600 font-medium">
                    <Icon
                      icon="lucide:check"
                      width="24"
                      height="24"
                      className="mr-2"
                    />
                    Aceptado
                  </span>
                ) : validationStatus.protocoloFirmas.estado_validacion ===
                  "Rechazado" ? (
                  <span className="flex items-center text-red-600 font-medium">
                    <Icon
                      icon="mdi:close"
                      width="24"
                      height="24"
                      className="mr-2"
                    />
                    Rechazado
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-600 font-medium">
                    <Icon
                      icon="lucide:clock"
                      width="24"
                      height="24"
                      className="mr-2"
                    />
                    Pendiente
                  </span>
                )}
                </div>
              </td>
              {isAdmin && (
                <td className="py-4 px-5 text-xl text-center flex items-center justify-center">
                  <button
                    className="text-blue-600 hover:text-blue-400"
                    onClick={() =>
                      handleOpenModalFirma(validationStatus.protocoloFirmas)
                    }
                  >
                    <Icon icon="lucide:captions" width="28" height="28" />
                  </button>
                </td>
              )}
            </tr>
          </tbody>
        </table>

        {/* Modal de detalles */}
        <SolicitarDetailsModal
          details={selectedSolicitarDetails}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleModalCloseWithUpdate} // Nueva prop para manejar el guardado y cierre con actualización
        />

        <SubirDetailsModal
          details={selectedSubirDetails}
          isOpen={isModalOpenSubir}
          onClose={handleCloseModalSubir}
          onSave={handleModalCloseWithUpdateSubir} // Nueva prop para manejar el guardado y cierre con actualización
        />

        <FirmaDetailsModal
          details={selectedFirmaDetails}
          isOpen={isModalOpenFirma}
          onClose={handleCloseModalFirma}
          onSave={handleModalCloseWithUpdateFirma} // Nueva prop para manejar el guardado y cierre con actualización
        />
      </div>
    </div>
  );
}

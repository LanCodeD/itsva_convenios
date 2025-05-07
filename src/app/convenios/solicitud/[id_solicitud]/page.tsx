"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation"; // Para obtener el ID dinámico
import CreateSolicitudForm from "../../estructura";
import SubirConvenioForm from "../../subir_convenio";
import ProtocoloFirmas from "../../protocolof";
import ValidationStatus from "../../Validacion";
import { useSession } from "next-auth/react"; // Si estás usando NextAuth para la autenticación
import { Icon } from "@iconify/react";
import DescargaConvenio from "../../descarga_c";
import Image from "next/image";

const DetalleSolicitud: React.FC = () => {
  const [estadoSecciones, setEstadoSecciones] = useState({
    solicitar: "bloqueado",
    subir_convenio: "bloqueado",
    protocolo_firmas: "bloqueado",
  });

  const [formData, setFormData] = useState(null);
  const [isNewRequest, setIsNewRequest] = useState(false); // Estado para determinar si es una nueva solicitud
  const [isRecoveryRequest, setIsRecoveryRequest] = useState(false); // Nuevo estado para determinar si es una solicitud recuperada
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id_solicitud } = useParams();
  const [activeTab, setActiveTab] = useState("solicitar");
  const [showForm, setShowForm] = useState(false);

  const isAdmin = session?.user?.role === "administrador"; //se necesita ajustar el backend de la solicitud axios

  //Cerrar bien la sesión
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
    } else if (status === "unauthenticated") {
      // Redirigir si el usuario no está autenticado
      router.push("/login");
    }
  }, [session, status, router]);

  // Cargar los datos de la solicitud existente
  useEffect(() => {
    if (id_solicitud && status === "authenticated") {
      const fetchSolicitudData = async () => {
        try {
          const response = await axios.get(
            `/api/solicitudes_convenios/${id_solicitud}`
          );
          const solicitud = response.data;
          //console.log("La solicitud que envia es esta: ", solicitud);

          const estadoSeccionesBackend = solicitud.estado_secciones
            ? JSON.parse(solicitud.estado_secciones)
            : {
                solicitar: "activo",
                subir_convenio: "bloqueado",
                protocolo_firmas: "bloqueado",
              };

          setEstadoSecciones(estadoSeccionesBackend);
          setFormData(solicitud);
          setIsNewRequest(false); // Dado que hay una solicitud existente, no es una nueva
          setIsRecoveryRequest(true); // Dado que estamos recuperando una solicitud, es una solicitud recuperada
          setShowForm(true); // Muestra el formulario
          setActiveTab("solicitar"); // Cambia a la pestaña de "Solicitar
          //console.log("Esto envía el setFormData ", setFormData);
        } catch (error) {
          console.error("Error al cargar los datos de la solicitud:", error);
          setErrorMessage("Error al cargar los datos de la solicitud.");
        }
      };

      fetchSolicitudData();
    } else {
      setIsNewRequest(true); // Si no hay id_solicitud, significa que es una nueva solicitud
      setIsRecoveryRequest(false); // Si es una nueva solicitud, no es una solicitud recuperada
      resetFormAndState(); // Función para resetear el estado
      setActiveTab("solicitar"); // Cambia a la pestaña de "Solicitar
      setShowForm(true); // Muestra el formulario
      //console.log("Se recuperó una nueva solicitud?: ", setIsRecoveryRequest);
    }
  }, [id_solicitud, status]);

  // Función para resetear el formulario y los estados si es una nueva solicitud
  const resetFormAndState = () => {
    setEstadoSecciones({
      solicitar: "activo", // La primera sección debe estar activa
      subir_convenio: "bloqueado",
      protocolo_firmas: "bloqueado",
    });
    setFormData(null); // Limpiar los datos del formulario
  };

  const handleFormLock = (section: string) => {
    setEstadoSecciones((prevState) => ({
      ...prevState,
      [section]: "completado",
      ...(section === "solicitar" && { subir_convenio: "activo" }),
      ...(section === "subir_convenio" && { protocolo_firmas: "activo" }),
    }));
  };

  const tabs = [
    {
      id: "solicitar",
      label: "Solicitar",
      icon: <Icon icon="lucide:pencil" width="24" height="24" />,
    },
    {
      id: "descargarC",
      label: "Carga de Convenio",
      icon: <Icon icon="lucide:download" width="24" height="24" />,
    },
    {
      id: "protocolof",
      label: "Protocolo de Firma",
      icon: <Icon icon="lucide:file-pen" width="24" height="24" />,
    },
    {
      id: "validacion",
      label: "Auditoría",
      icon: <Icon icon="lucide:check" width="24" height="24" />,
    },
  ];

  return (
    <div className="mt-2 p-2">
      {errorMessage && <div className="error">{errorMessage}</div>}

      {showForm && (
        <>
          <nav className="flex justify-around space-x-2 bg-guinda p-4 rounded-t-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-4 rounded ${
                  activeTab === tab.id
                    ? "bg-colorDorado text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className=" bg-white border rounded-b-lg mt-2">
            {activeTab === "solicitar" && (
              <SolicitarForm
                onFormSubmit={() => handleFormLock("solicitar")}
                formData={formData} // Pasamos los datos cargados como prop
                estadoSecciones={estadoSecciones}
              />
            )}

            {activeTab === "descargarC" && (
              <DescargarCSection
                isNewRequest={isNewRequest}
                isRecoveryRequest={isRecoveryRequest} // Nueva prop aquí
                onFormSubmit={() => handleFormLock("subir_convenio")}
                estadoSecciones={estadoSecciones}
              />
            )}
            {activeTab === "protocolof" && (
              <PfirmaSection
                isNewRequest={isNewRequest}
                isRecoveryRequest={isRecoveryRequest} // Nueva prop aquí
                onFormSubmit={() => handleFormLock("protocolo_firmas")}
                estadoSecciones={estadoSecciones}
              />
            )}
            {activeTab === "validacion" && (
              <AuditoriaSection
                isNewRequest={isNewRequest}
                isRecoveryRequest={isRecoveryRequest}
                isAdmin={isAdmin}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Componentes de sección
const SolicitarForm = ({
  onFormSubmit,
  formData,
  estadoSecciones,
}: {
  onFormSubmit: () => void;
  formData: any;
  estadoSecciones: any;
}) => (
  <div className="bg-gray-50  rounded-lg shadow-lg max-w-full mx-auto ">
    {/* Encabezado con fondo de color diferente */}
    <div className="bg-colorHeader p-5 rounded-t-lg">
      <h2 className="text-3xl font-bold text-textGrispalido text-center">
        Solicitar Convenio
      </h2>
    </div>

    <div className="flex flex-col md:flex-row p-4 bg-white rounded-b-lg">
      {/* Formulario a la izquierda */}
      <div className="w-full h-auto md:w-1/2 p-4">
        <CreateSolicitudForm
          estadoSecciones={estadoSecciones} // Estado dinámico
          onSubmit={onFormSubmit}
          formData={formData} // Datos cargados
        />
      </div>

      {/* Imagen decorativa a la derecha */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center relative max-w-xl h-auto">
        <Image
          src="/resource/image/formu1.png"
          alt="Imagen decorativa"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="rounded-lg object-contain"
        />
      </div>
    </div>
  </div>
);

const DescargarCSection = ({
  isNewRequest,
  isRecoveryRequest, // Nueva prop para saber si es una solicitud recuperada
  onFormSubmit,
  estadoSecciones,
}: {
  isNewRequest: boolean;
  isRecoveryRequest: boolean; // Nueva prop
  onFormSubmit: () => void;
  estadoSecciones: any;
}) => (
  <div className="bg-gray-50 rounded-lg shadow-lg max-w-full mx-auto">
    {/* Encabezado */}
    <div className="bg-colorHeader p-5 rounded-t-lg">
      <h2 className="text-3xl font-semibold text-textGrispalido text-center">
        Carga de Convenio
      </h2>
    </div>

    {/* Sección de descarga */}
    <div className="p-6">
      <DescargaConvenio />
    </div>

    <div className="flex flex-col md:flex-row p-6 bg-white rounded-b-lg">
      {/* Formulario de subida */}
      <div className="w-full md:w-1/2">
        <SubirConvenioForm
          isNewRequest={isNewRequest}
          isRecoveryRequest={isRecoveryRequest}
          estadoSecciones={estadoSecciones}
          onSubmit={onFormSubmit}
        />
      </div>

      {/* Imagen decorativa */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center relative max-w-md h-screen max-h-[50vh]  ">
        <Image
          src="/resource/image/formu5.png"
          alt="Imagen decorativa"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="rounded-lg object-contain"
        />
      </div>
    </div>
  </div>
);

const PfirmaSection = ({
  isNewRequest,
  isRecoveryRequest,
  estadoSecciones,
  onFormSubmit,
}: {
  isNewRequest: boolean;
  isRecoveryRequest: boolean; // Nueva prop
  estadoSecciones: any;
  onFormSubmit: () => void;
}) => (
  <div className="bg-gray-50 rounded-lg shadow-lg max-w-full mx-auto">
    <div className="bg-colorHeader p-5 rounded-t-lg">
      <h2 className="text-3xl font-semibold text-white text-center">
        Protocolo de Firma
      </h2>
    </div>

    <div className="flex flex-col md:flex-row p-8 bg-white rounded-b-lg">
      <div className="hidden md:flex md:w-1/2 items-center justify-center relative max-w-lg h-screen max-h-[60vh] ">
        <Image
          src="/resource/image/formu3.png"
          alt="Imagen decorativa"
          fill
          sizes="(min-width: 768px) 25vw, 100vw"
          className="rounded-lg object-contain"
        />
      </div>

      {/* Formulario a la izquierda */}
      <div className="w-full h-auto md:w-1/2 p-8">
        <ProtocoloFirmas
          isNewRequest={isNewRequest}
          isRecoveryRequest={isRecoveryRequest}
          estadoSecciones={estadoSecciones}
          onSubmit={onFormSubmit}
        />
      </div>
    </div>
  </div>
);

const AuditoriaSection = ({
  isNewRequest,
  isRecoveryRequest,
  isAdmin,
}: {
  isNewRequest: boolean;
  isRecoveryRequest: boolean;
  isAdmin: boolean;
}) => (
  <div className="bg-gray-50 rounded-lg shadow-lg max-w-full mx-auto">
    <div className="bg-colorHeader p-5 rounded-t-lg">
      <h2 className="text-3xl font-semibold text-white text-center">
        Validación
      </h2>
    </div>

    <div>
      <ValidationStatus
        isNewRequest={isNewRequest}
        isRecoveryRequest={isRecoveryRequest}
        isAdmin={isAdmin}
      />
    </div>
  </div>
);
export default DetalleSolicitud;

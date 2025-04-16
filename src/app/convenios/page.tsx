"use client";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import CreateSolicitudForm from "./estructura";
import PageWrapper from "../../components/page-wrapper";
import DescargaConvenio from "./descarga_c";
import SubirConvenioForm from "./subir_convenio";
import ProtocoloFirmas from "./protocolof";
import ValidationStatus from "./Validacion";
import axios from "axios"; // Importa axios para hacer la llamada a la API
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const PageComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("solicitar");
  const [showForm, setShowForm] = useState(false);
  const [isNewRequest, setIsNewRequest] = useState(false); // Para manejar si es una nueva solicitud
  const [formData, setFormData] = useState(null); // Estado para los datos precargados del formulario
  const [isRecoveryRequest, setIsRecoveryRequest] = useState(false); // Para manejar si es una solicitud recuperada
  const { data: session, status } = useSession(); // Obtener la sesión
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Estado para el mensaje de error
  const router = useRouter(); // Inicializar useRouter
  // Determinar si el usuario es administrador
  const isAdmin = session?.user?.role === "administrador";
  // Estado para manejar el estado de cada sección (bloqueado, activo, completado)
  const [estadoSecciones, setEstadoSecciones] = useState({
    solicitar: "activo", // El estado inicial de "solicitar" es activo cuando se crea una nueva solicitud
    subir_convenio: "bloqueado",
    protocolo_firmas: "bloqueado",
    // validacion: "bloqueado",
  });

  //Cerrar bien la sesión
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
    } else if (status === "unauthenticated") {
      // Redirigir si el usuario no está autenticado
      router.push("/login");
    }
  }, [session, status, router]);

  // Función para manejar la redirección al historial de solicitudes
  const handleHistorialSolicitudes = () => {
    router.push("../obtenerc"); // Redirigir a la página de "Convenios Solicitados"
  };

  // Función para manejar la creación de una nueva solicitud
  const handleNewSolicitud = async () => {
    setErrorMessage(null); // Limpiar el mensaje de error antes de intentar la creación

    if (status === "authenticated" && session?.user?.id) {
      try {
        const usuarioId = session.user.id; // Obtener el ID del usuario autenticado

        // Llamada a la API para crear una nueva solicitud
        const response = await axios.post("/api/solicitudes_convenios", {
          usuario_id: usuarioId, // Usar el ID del usuario autenticado
        });

        // Verifica la respuesta y maneja el éxito de la solicitud
        if (response.status === 201) {
          //console.log("Nueva solicitud creada exitosamente", response.data);

          setIsNewRequest(true); // Indicar que es una nueva solicitud
          setIsRecoveryRequest(false); // No es una solicitud recuperada
          setActiveTab("solicitar"); // Cambia a la pestaña de "Solicitar"
          setShowForm(true); // Muestra el formulario

          // Actualiza el estado de las secciones: sólo la primera sección está activa
          setEstadoSecciones({
            solicitar: "activo",
            subir_convenio: "bloqueado",
            protocolo_firmas: "bloqueado",
            // validacion: "bloqueado",
          });

          setFormData(null); // Reiniciar datos del formulario
        }
      } catch (error: any) {
        console.error("Error al crear una nueva solicitud", error);

        // Si la respuesta contiene el mensaje de error, lo mostramos
        if (
          error.response && //las condiciones se envian al backend.
          error.response.data &&
          error.response.data.message
        ) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Ocurrió un error inesperado al crear la solicitud.");
        }
      }
    } else {
      console.error("El usuario no está autenticado");
    }
  };

  // Función para actualizar el estado de las secciones
  const handleFormLock = (section: string) => {
    setEstadoSecciones((prevState) => ({
      ...prevState,
      [section]: "completado", // Marca la sección como completada
      ...(section === "solicitar" && { subir_convenio: "activo" }),
      ...(section === "subir_convenio" && { protocolo_firmas: "activo" }),
      ...(section === "protocolo_firmas" && { validacion: "activo" }),
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
    <div className="mt-2 p-2 h-full">
      {!showForm && (
        <div className="max-w-full w-full mx-auto bg-white flex flex-col items-center space-y-4 rounded-lg h-full">
          {/* Primer botón con su imagen al lado */}
          <div className="flex items-center mt-4 pb-4 w-full h-full">
            <img
              src="/resource/image/formu7.png"
              alt="Imagen de agregar"
              className="max-w-xl w-full h-full max-h-[40vh] object-contain rounded-lg"
            />

            <div className="bg-gray-50 rounded-lg shadow-lg text-center items-center justify-center w-full h-full mr-10 ">
              <div className="bg-sky-900 p-4 rounded-t-lg">
                <h2 className="text-3xl font-bold text-textGrispalido text-center">
                  Agregar Nueva Solicitud
                </h2>
              </div>
              <div className="p-6">
                <button
                  className="bg-colorDorado text-white px-4 py-2 rounded shadow-md ring-2 ring-gray-300 hover:bg-yellow-500 transition-transform transform hover:scale-105 animate-fade-in"
                  onClick={handleNewSolicitud}
                >
                  ¡Click Aquí!
                </button>

                <p className="mt-4 text-gray-700 text-2xl font-semibold">
                  Crea una nueva solicitud para iniciar un proceso.
                </p>
                {/* Mensaje de error */}
                {errorMessage && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded shadow-md">
                    <p>{errorMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Segundo botón con su imagen al lado */}
          <div className="flex items-center pb-4 w-full h-full">
            <div className="bg-gray-50 rounded-lg shadow-lg text-center items-center justify-center w-full h-full ml-10">
              <div className="bg-sky-900 p-4 rounded-t-lg">
                <h2 className="text-3xl font-bold text-textGrispalido text-center">
                  Historial De Solicitudes
                </h2>
              </div>
              <div className="p-6">
                <button
                  onClick={handleHistorialSolicitudes}
                  className="bg-colorDorado text-white px-4 py-2 rounded shadow-md ring-2 ring-gray-300 hover:bg-yellow-500 transition-transform transform hover:scale-105 animate-fade-in"
                >
                  ¡Click Aquí!
                </button>
                <p className="mt-4 text-gray-700 text-2xl font-semibold">
                  Revisa el historial de solicitudes creadas anteriormente.
                </p>
              </div>
            </div>
            <img
              src="/resource/image/formu2.png"
              alt="Imagen de historial"
              className="max-w-xl w-full h-full max-h-[40vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

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
    <div className="hidden md:flex md:w-1/2 items-center justify-center">
      <img
        src="/resource/image/formu1.png" // Cambia esta ruta a la de tu imagen
        alt="Imagen decorativa"
        className="max-w-xl h-auto rounded-lg justify-center"
      />
    </div>
  </div>
</div>
);

const DescargarCSection = ({
  isNewRequest,
  onFormSubmit,
  isRecoveryRequest, // Nueva prop aquí
  estadoSecciones,
}: {
  isNewRequest: boolean;
  onFormSubmit: () => void;
  isRecoveryRequest: boolean;
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
      <div className="hidden md:flex md:w-1/2 items-center justify-center">
        <img
          src="/resource/image/formu5.png" // Cambia esta ruta a la de tu imagen
          alt="Imagen decorativa"
          className="max-w-xs h-auto rounded-lg "
        />
      </div>
    </div>
  </div>
);

const PfirmaSection = ({
  isNewRequest,
  estadoSecciones,
  isRecoveryRequest,
  onFormSubmit,
}: {
  isNewRequest: boolean;
  isRecoveryRequest: boolean;
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
      <div className="hidden md:flex md:w-1/2 items-center justify-center">
        <img
          src="/resource/image/formu3.png" // Cambia esta ruta a la de tu imagen
          alt="Imagen decorativa"
          className="max-w-xs h-auto rounded-lg justify-center"
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

export default PageComponent;

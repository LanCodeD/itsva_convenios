"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useParams } from "next/navigation";


interface SubirConvenioFormProps {
  estadoSecciones: { subir_convenio: string }; // Estado para la sección de subir convenio.
  isNewRequest: boolean; // Para manejar si es una nueva solicitud.
  isRecoveryRequest: boolean; // Nueva prop para manejar solicitudes recuperadas.
  onSubmit: () => void; // Callback para manejar el submit exitoso.
}

const SubirConvenioForm: React.FC<SubirConvenioFormProps> = ({
  estadoSecciones,
  isNewRequest,
  isRecoveryRequest, // Nueva prop recibida
  onSubmit,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [iconName, setIconName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [hasUploaded, setHasUploaded] = useState(false); // Para controlar si el archivo ya se ha subido
  const [isFormLocked, setIsFormLocked] = useState(false); // Bloquear el formulario si es necesario
  const { data: session, status } = useSession();
  const [estadoValidacion, setEstadoValidacion] = useState<string | null>(null); // Estado para 'estado_validacion'
  const params = useParams();
  const { id_solicitud } = params;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id_solicitud) {
      const fetchData = async () => {
        try {
          // Hacer el llamado al backend con el id de la URL
          const response = await axios.get(`/api/subir_c/nuevoc/${id_solicitud}`);
          // console.log("id con useEffects, ", id_solicitud)
          const fileData = response.data;
          setData(response.data);
          // console.log("Esto manda el reponso del primer useEffets", response.data)
          setEstadoValidacion(fileData.estado_validacion); // Guarda el estado de validación
          //console.log("Esto guarda validacion, ",fileData)
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [id_solicitud]);

  //console.log("esto es el id de id_subir_convenio: ",id_solicitud);

  useEffect(() => {
    // Si la sección 'subir_convenio' está completada, bloquear el formulario.
    if (estadoSecciones && estadoSecciones.subir_convenio) {
      if (estadoSecciones.subir_convenio === "completado") {
        setIsFormLocked(true);
      } else {
        setIsFormLocked(false); // Si está desbloqueado o es editable, el usuario puede interactuar.
      }
    }
  }, [estadoSecciones]);
  //console.log("este es el estado de las secciones", estadoSecciones);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormLocked || hasUploaded || !file) return;

    const formData = new FormData();
    const uniqueId = Date.now(); // Genera un ID único usando el timestamp actual
      formData.append("file", file);
      formData.append("upload_preset", "lv8srnhn");
      formData.append("public_id", `${file.name.split('.').slice(0, -1).join('.')}-${uniqueId}`);

    try {
      const cloudinaryResponse = await axios.post(
        "https://api.cloudinary.com/v1_1/dce75mcva/upload", //direcciónde mi usuario de la carpeta en cloudinary
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;

            setUploadStatus(`Subiendo: ${progress}%`);
          },
        }
      );
      
      const fileUrl = cloudinaryResponse.data.secure_url;
      //console.log("Datos enviados al backend:", { convenio_subir: fileUrl, id_solicitud });
      //console.log("ID de solicitud:", id_solicitud);
      //console.log("URL del archivo a enviar:", fileUrl);
     
      let response;
      data
      if (estadoValidacion === "Rechazado") {
        // Si el estado es "Rechazado", hacemos un PUT
        response = await axios.put(`/api/subir_c/nuevoc/${id_solicitud}`,
          { convenio_subir: fileUrl },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Si es una nueva subida, hacemos un POST
        response = await axios.post(
          "/api/subir_c",
          { convenio_subir: fileUrl, id_solicitud },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }


      if (response.status === 200 || response.status === 201) {
        setUploadStatus("Archivo subido exitosamente.");
        setIconName("lucide:file-check");
        setHasUploaded(true);
        onSubmit();
      } else {
        setUploadStatus("Error al guardar el archivo.");
        setIconName("mdi:alert-circle-outline");
      }
    } catch (error) {
      console.error("Error al subir convenio:", error);
      setUploadStatus("Error en la solicitud (máx. 2MB).");
      setIconName("mdi:alert-circle-outline");
    }
  };

  useEffect(() => {
    const checkUploadedFile = async () => {
      try {
        const response = await axios.get("/api/subir_c");
        if (
          response.status === 200 &&
          response.data.length > 0 &&
          !isNewRequest &&
          !isRecoveryRequest
        ) {
          // Evitamos cargar archivos si es una solicitud recuperada.
          const fileData = response.data[0];
          setHasUploaded(true); // Si ya hay un archivo subido.
          setUploadedFile(fileData); // Establece el archivo subido.
          setIsFormLocked(true); // Asegúrate de bloquear el formulario.
        } else if (isNewRequest || isRecoveryRequest) {
          setHasUploaded(false); // Resetear el estado si es una nueva solicitud o recuperación.
          resetSubirConvenio();
        }
      } catch (error) {
        console.error("Error al obtener el archivo subido:", error);
      }
    };

    checkUploadedFile();

    if (!session && status === "unauthenticated") {
      resetSubirConvenio();
    }
  }, [session, status, isNewRequest, isRecoveryRequest]);

  const resetSubirConvenio = () => {
    setFile(null);
    setUploadedFile(null);
    setUploadStatus(null);
    setIconName(null);
    setHasUploaded(false);
  };

  // En esta parte, el formulario se comporta de acuerdo con el estado de "subir_convenio".
  return (
    <div className="w-full max-w-lg mx-auto bg-gray-50 p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
        Subir Convenio
      </h1>
      {isFormLocked ? (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
          <p className="font-bold">Convenio subido exitosamente</p>
          <p>El formulario está bloqueado. No puedes realizar cambios.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-blue-500 "
            accept=".pdf,.doc,.docx"
            disabled={isFormLocked || hasUploaded}
          />
          <button
            type="submit"
            className={`w-full py-3 bg-colorDorado text-white rounded hover:bg-yellow-500 transition ${
              isFormLocked || hasUploaded ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isFormLocked || hasUploaded}
          >
            Subir Archivo
          </button>
        </form>
      )}
      {uploadStatus && (
        <div className="flex items-center justify-center mt-4">
          {iconName && <Icon icon={iconName} width="24" height="24" />}
          <p className="ml-2 text-center text-blue-700 font-semibold">
            {uploadStatus}
          </p>
        </div>
      )}
      {uploadedFile && (
        <div className="mt-4 text-gray-700">
          <p>
            <strong>Fecha de subida:</strong>
            {new Date(uploadedFile.fecha_subida).toLocaleString()}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            {uploadedFile.estado || "Pendiente de revisión"}
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <a
              href={uploadedFile.convenio_subir}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline flex items-center"
            >
              <Icon icon="lucide:file-text" width="24" height="24" />
              <span>Ver archivo</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubirConvenioForm;


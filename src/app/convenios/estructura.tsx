"use client";
import { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

interface CreateSolicitudFormProps {
  estadoSecciones: { solicitar: string };
  onSubmit: () => void;
  formData?: {
    nombre_solicitante: string;
    correo_solicitar: string;
    telefono: string;
    clave_matricula: string;
  };
}

const CreateSolicitudForm: React.FC<CreateSolicitudFormProps> = ({
  estadoSecciones,
  onSubmit,
  formData = {
    nombre_solicitante: "",
    correo_solicitar: "",
    telefono: "",
    clave_matricula: "",
  },
}) => {
  const [isFormLocked, setIsFormLocked] = useState(false);

  const [nombreSolicitante, setNombreSolicitante] = useState(formData?.nombre_solicitante || "");
  const [correoSolicitar, setCorreoSolicitar] = useState(formData?.correo_solicitar || "");
  const [telefono, setTelefono] = useState(formData?.telefono || "");
  const [claveMatricula, setClaveMatricula] = useState(formData?.clave_matricula || "");

  useEffect(() => {
    if (estadoSecciones && estadoSecciones.solicitar === "completado") {
      setIsFormLocked(true);
    } else {
      setIsFormLocked(false);
    }
  }, [estadoSecciones]);

  //console.log("este es el estado de solicitar",estadoSecciones);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormLocked) return;

    const formData = new FormData(e.currentTarget);
    try {
      const res = await axios.post("/api/auth/solicitar", {
        nombre_solicitante: formData.get("nombre_solicitante"),
        correo_solicitar: formData.get("correo_solicitar"),
        telefono: formData.get("telefono"),
        clave_matricula: formData.get("clave_matricula"),
      });

      if (res.status === 201) {
        setIsFormLocked(true);
        onSubmit();
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    }
  };

  return (
    <div className="max-w-full mx-auto">
      {isFormLocked ? (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
          <p className="font-semibold">Solicitud enviada exitosamente</p>
          <p>El formulario está bloqueado. No puedes realizar cambios en esta solicitud.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-90000 mb-6">Rellena el Formulario</h2>
  
          <div className="space-y-4">
            {/* Nombre */}
            <div className="relative">
              <label className="block text-gray-500 font-semibold text-lg">Nombre</label>
              <input
                type="text"
                name="nombre_solicitante"
                placeholder="Nombre"
                className="w-full bg-white block border border-gray-300 rounded-md py-2 px-4 mt-2 pl-9 text-blue-950 font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(212,175,55)]"
                value={nombreSolicitante}
                onChange={(e) => setNombreSolicitante(e.target.value)}
                required
                disabled={isFormLocked}
              />
            <span className="absolute left-2 top-3/4 transform -translate-y-1/2 pb-1 text-gray-400">
              <Icon icon="lucide:user-round-pen" width="20" height="20" />
            </span>
            </div>
  
            {/* Correo */}
            <div className="relative">
              <label className="block text-gray-500 font-semibold text-lg">Correo</label>
              <input
                type="email"
                placeholder="Correo"
                name="correo_solicitar"
                className="w-full bg-white border block border-gray-300 rounded-md py-2 px-4 mt-2 pl-9 text-blue-950 font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(212,175,55)]"
                value={correoSolicitar}
                onChange={(e) => setCorreoSolicitar(e.target.value)}
                required
                disabled={isFormLocked}
              />
            <span className="absolute left-2 top-3/4 transform -translate-y-1/2 pb-1 text-gray-400">
              <Icon icon="lucide:mail" width="20" height="20" />
            </span>
            </div>
  
            {/* Teléfono */}
            <div className="relative">
              <label className="block text-gray-500 font-semibold text-lg">Teléfono</label>
              <input
                type="text"
                name="telefono"
                placeholder="Teléfono"
                className="w-full bg-white border block border-gray-300 rounded-md py-2 px-4 mt-2 pl-9 text-blue-950 font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(212,175,55)]"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                disabled={isFormLocked}
              />
            <span className="absolute left-2 top-3/4 transform -translate-y-1/2 pb-1 text-gray-400">
              <Icon icon="lucide:smartphone" width="20" height="20" />
            </span>
            </div>
  
            {/* Clave Matrícula */}
            <div className="relative">
              <label className="block text-gray-500 font-semibold text-lg">Clave Matrícula</label>
              <input
                type="text"
                name="clave_matricula"
                placeholder="Clave/Matrícula"
                className="w-full bg-white border block pl-9 border-gray-300 rounded-md py-2 px-4 mt-2 mb-6 text-blue-950 font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(212,175,55)]"
                value={claveMatricula}
                onChange={(e) => setClaveMatricula(e.target.value)}
                disabled={isFormLocked}
              />
            <span className="absolute left-2 top-3/4 transform -translate-y-1/2 pb-1 text-gray-400">
              <Icon icon="lucide:id-card" width="20" height="20" />
            </span>
            </div>
          </div>
  
          <button
            type="submit"
            className={`w-full bg-colorDorado text-white text-lg font-semibold py-3 rounded-md hover:bg-yellow-500 transition-colors ${
              isFormLocked ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isFormLocked}
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  );
  
};

export default CreateSolicitudForm;

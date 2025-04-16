"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { DatePicker, ConfigProvider } from "antd";
import es_ES from "antd/es/locale/es_ES"; // Asegúrate de tener esto correctamente configurado
import { useParams } from "next/navigation";
import '@/globals.css';


interface ProtocoloFirmasProps {
  isNewRequest: boolean; // Indica si es una nueva solicitud
  isRecoveryRequest: boolean; // Indica si es una solicitud recuperada
  estadoSecciones: { protocolo_firmas: string }; // Estado de la sección Protocolo Firmas
  onSubmit: () => void; // Función que se ejecuta al enviar el formulario
}

const ProtocoloFirmas: React.FC<ProtocoloFirmasProps> = ({
  isNewRequest,
  isRecoveryRequest,
  estadoSecciones,
  onSubmit,
}) => {
  const [requiereProtocolo, setRequiereProtocolo] = useState<string | null>(
    null
  );
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isFormLocked, setIsFormLocked] = useState(false); // Bloqueo inicial
  const [estadoValidacion, setEstadoValidacion] = useState<string | null>(null); // Estado para 'estado_validacion'
  const params = useParams();
  const { id_solicitud } = params;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id_solicitud) {
      const fetchData = async () => {
        try {
          // Hacer el llamado al backend con el id de la URL
          const response = await axios.get(
            `/api/protocolo_firmas/nuevopro/${id_solicitud}`
          );
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
  //console.log("El id desde protocolo FIRMAS: ", id_solicitud);

  //console.log("El primer estado que sube es: ", estadoSecciones);

  useEffect(() => {
    // Si la sección 'subir_convenio' está completada, bloquear el formulario.
    if (estadoSecciones && estadoSecciones.protocolo_firmas) {
      if (estadoSecciones.protocolo_firmas === "completado") {
        setIsFormLocked(true);
      } else {
        setIsFormLocked(false); // Si está desbloqueado o es editable, el usuario puede interactuar.
      }
    }
  }, [estadoSecciones]);

  // Desbloquear formulario si es una solicitud recuperada y no está completa
  useEffect(() => {
    const fetchProtocolo = async () => {
      try {
        const response = await axios.get("/api/protocolo_firmas");
        if (response.data.length > 0 && !isNewRequest && !isRecoveryRequest) {
          setIsFormLocked(true); // Indica que ya se ha enviado el formulario
          setMessage(
            "Ya has seleccionado un protocolo. No puedes realizar cambios."
          );
        } else if (isNewRequest || isRecoveryRequest) {
          resetProtocoloFirmas(); // Reseteamos el formulario si es una nueva solicitud o recuperada
        }
      } catch (error) {
        console.error("Error fetching protocolo:", error);
      }
    };

    fetchProtocolo();
  }, [isNewRequest, isRecoveryRequest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isFormLocked) return;

    try {
      let response;
      data;
      //console.log("Esto es el data", data)
      // Verificamos si el protocolo ya fue guardado antes (estado que indica si debemos hacer PUT o POST)
      if (estadoValidacion === "Rechazado") {
        // Si el protocolo ha sido rechazado, hacemos un PUT para actualizarlo
        response = await axios.put(
          `/api/protocolo_firmas/nuevopro/${id_solicitud}`,
          {
            requiere_protocolo: requiereProtocolo,
            fecha_seleccionada:
              requiereProtocolo === "sí" ? fechaSeleccionada : null,
          }
        );
      } else {
        // Si es la primera vez que guardamos el protocolo, hacemos un POST
        response = await axios.post("/api/protocolo_firmas", {
          requiere_protocolo: requiereProtocolo,
          fecha_seleccionada:
            requiereProtocolo === "sí" ? fechaSeleccionada : null,
        });
      }

      // Comprobamos la respuesta del servidor
      if (response.status === 201 || response.status === 200) {
        setMessage("Protocolo de firmas guardado con éxito.");
        setIsFormLocked(true); // Bloquear el formulario después de guardar
        onSubmit(); // Llamar a la función onSubmit pasada como prop
      } else {
        setMessage("Error al guardar el protocolo de firmas.");
      }
    } catch (error) {
      setMessage("Error en la solicitud.");
    }
  };

  const resetProtocoloFirmas = () => {
    setRequiereProtocolo(null);
    setFechaSeleccionada(null);
    setMessage(null); // Limpia el mensaje
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg ml-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Protocolo de Firmas</h1>
      <h3 className="text-lg font-medium mb-6 text-center text-gray-700">
        ¿Requiere Solicitar el Protocolo de Firmas?
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-10">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="sí"
              checked={requiereProtocolo === "sí"}
              onChange={() => setRequiereProtocolo("sí")}
              disabled={isFormLocked}
              className="text-textDorado focus:ring-yellow-500"
            />
            <span className="text-gray-900 font-medium">Sí</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="no"
              checked={requiereProtocolo === "no"}
              onChange={() => setRequiereProtocolo("no")}
              disabled={isFormLocked}
              className="text-textDorado focus:ring-yellow-500"
            />
            <span className="text-gray-900 font-medium">No</span>
          </label>
        </div>

        {requiereProtocolo === "sí" && (
          <div className="text-center">
            <label className="block text-gray-700 font-semibold mb-2">
              Seleccione una fecha:
            </label>
            <ConfigProvider locale={es_ES}>
              <DatePicker
                onChange={(date, dateString) => {
                  if (typeof dateString === "string") {
                    setFechaSeleccionada(dateString);
                  }
                }}
                disabled={isFormLocked}
                className="w-full rounded-lg border border-gray-300 focus:border-yellow-500 focus:ring focus:ring-yellow-200 text-gray-900"
                popupClassName="custom-datepicker-popup"  
              />
            </ConfigProvider>
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-3 text-textGrispalido rounded-lg font-semibold transition-colors duration-200 ${
            isFormLocked ? "bg-yellow-300 cursor-not-allowed" : "bg-colorDorado hover:bg-yellow-500"
          }`}
          disabled={isFormLocked}
        >
          Guardar
        </button>
      </form>

      {message && (
        <p className="mt-6 text-center text-guindaclaro font-bold">
          {message}
        </p>
      )}
    </div>
  );
};

export default ProtocoloFirmas;

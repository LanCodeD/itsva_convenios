import React, { useState, useEffect } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

interface descargar_formato {
  id_descargar_formato: number;
  documento: string;
  link: string;
}

function DescargaConvenio() {
  const [documentos, setDocumentos] = useState<descargar_formato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Función para obtener los documentos desde la API
    const fetchDocumentos = async () => {
      try {
        const response = await axios.get("/api/descarga_c"); // Ajusta la ruta según tu configuración
        setDocumentos(response.data.documentos);
      } catch (err) {
        setError("Error al cargar los documentos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentos();
  }, []);

  if (loading) {
    return <div>Cargando documentos...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 items-center bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
        Descarga tu Documento
      </h2>
      <table className="w-full bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-colorDorado text-textGrispalido">
          <tr>
            <th className="py-3 px-4 text-left font-semibold text-xl">Documento</th>
            <th className="py-3 px-4 text-center font-semibold text-xl">Descargas</th>
          </tr>
        </thead>
        <tbody>
          {documentos.map((doc) => (
            <tr key={doc.id_descargar_formato} className="border-t">
              <td className="py-4 px-4 text-gray-900 ">{doc.documento}</td>
              <td className="py-4 px-4 text-center">
                <div className="flex justify-center items-center">
                  <a
                    href={doc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Icon icon="lucide:download" width="24" height="24" />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-center text-gray-600 font-semibold">
        Renombra el archivo como -
        <strong>"Matrícula/Clave_Nombre_Apellido"</strong> - Ejemplo:
        <strong> "22070000_Raul_Ku"</strong>
        <br />
        En caso de <strong>NO</strong> ser estudiante, renombrar el archivo como -
        <strong>"Nombre_Apellido"</strong> - Ejemplo:
        <strong>"Raul_Ku"</strong>
      </p>
    </div>
  );
}

export default DescargaConvenio;


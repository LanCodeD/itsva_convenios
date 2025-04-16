"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./modal"; // Asegúrate de que la ruta sea correcta
import ConfirmacionModal from "./ConfirmacionModal"; // Nuevo modal de confirmación
import { Icon } from "@iconify/react";
import ReactPaginate from "react-paginate"; // Importar la librería de paginación
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Solicitud {
  id_solicitudes: number;
  usuario_id: number;
  estado_solicitud: string;
  fecha_creacion: string;
  nombre: string;
  correo: string;
  fecha_finalizacion: string | null;
}

const GestionConvenios = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar el modal de detalles
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false); // Modal de confirmación para eliminar
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null); // Solicitud seleccionada
  const [searchQuery, setSearchQuery] = useState(""); // Estado para la búsqueda
  const [currentPage, setCurrentPage] = useState(0); // Página actual para la paginación
  const { data: session, status } = useSession(); // Obtener la sesión
  const router = useRouter(); // Inicializar useRouter
  const solicitudesPorPagina = 10; // Número de solicitudes por página

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchSolicitudes = async () => {
        try {
          const response = await axios.get(
            "/api/solicitudes_convenios/admiAll"
          ); // Asegúrate de que este sea el path correcto
          const data = await response.data;
          setSolicitudes(data);
        } catch (error) {
          console.error("Error al obtener solicitudes:", error);
        }
      };

      fetchSolicitudes();
    } else if (status === "unauthenticated") {
      // Redirigir si el usuario no está autenticado
      router.push("/login");
    }
  }, [session, status, router]);

  // Función para abrir el modal con la solicitud seleccionada
  const openModal = (solicitud: any) => {
    setSelectedSolicitud(solicitud); // Guardar la solicitud seleccionada
    setIsOpen(true); // Abrir el modal
  };

  // Función para abrir el modal de confirmación de eliminación
  const openConfirmationModal = (solicitud: any) => {
    setSelectedSolicitud(solicitud); // Guardar la solicitud seleccionada para eliminar
    setIsConfirmationOpen(true); // Abrir el modal de confirmación
  };

  // Nueva función para eliminar una solicitud por su ID
  const eliminarSolicitud = async (id_solicitudes: number) => {
    try {
      await axios.delete(
        `/api/solicitudes_convenios/Finalizar/${id_solicitudes}`
      ); // Asegúrate de que la ruta DELETE sea correcta
      // Después de eliminar, actualizamos la lista de solicitudes
      setSolicitudes((prevSolicitudes) =>
        prevSolicitudes.filter(
          (solicitud) => solicitud.id_solicitudes !== id_solicitudes
        )
      );
      // Mostrar Toast de éxito
      toast.success("Solicitud eliminada exitosamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error al eliminar la solicitud:", error);
      // Mostrar Toast de error
      toast.error("Ocurrió un error al eliminar la solicitud.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Función para manejar la confirmación de eliminación en el modal
  const confirmarEliminacion = () => {
    if (selectedSolicitud) {
      eliminarSolicitud(selectedSolicitud.id_solicitudes); // Llamamos a la función para eliminar la solicitud seleccionada
      setIsConfirmationOpen(false); // Cerrar el modal después de eliminar
    }
  };

  // Función para finalizar la solicitud
  const finalizarSolicitud = async (id_solicitudes: number) => {
    try {
      const response = await axios.get(
        `/api/solicitudes_convenios/Finalizar/${id_solicitudes}`
      );
      const solicitud = response.data;

      const {
        estado_validacion_solicitar,
        estado_validacion_subir_convenio,
        estado_validacion_protocolo_firmas,
      } = solicitud;

      if (
        estado_validacion_solicitar === "Aceptado" &&
        estado_validacion_subir_convenio === "Aceptado" &&
        estado_validacion_protocolo_firmas === "Aceptado"
      ) {
        // Llamada PUT para finalizar la solicitud
        const responsePut = await axios.put(
          `/api/solicitudes_convenios/Finalizar/${id_solicitudes}`,
          {
            fecha_finalizacion: new Date(), // Actualiza la fecha de finalización
          }
        );

        const updatedSolicitud = responsePut.data; // Datos actualizados desde el PUT

        // Actualiza la lista de solicitudes en el estado
        setSolicitudes((prevSolicitudes) =>
          prevSolicitudes.map((solicitud) =>
            solicitud.id_solicitudes === id_solicitudes
              ? {
                  ...solicitud,
                  fecha_finalizacion: updatedSolicitud.fecha_finalizacion,
                }
              : solicitud
          )
        );

        toast.success("La solicitud ha sido finalizada exitosamente.", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(
          "No se puede finalizar la solicitud porque algunas secciones no han sido aceptadas.",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }
    } catch (error) {
      console.error("Error al finalizar la solicitud:", error);
      toast.error("Ocurrió un error al intentar finalizar la solicitud.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Función para manejar el cambio de página en la paginación
  const handlePageChange = (selected: { selected: number }) => {
    setCurrentPage(selected.selected);
  };

  // Función para filtrar las solicitudes basado en el input de búsqueda
  const solicitudesFiltradas = solicitudes.filter((solicitud) => {
    const query = searchQuery.toLowerCase();
    return (
      solicitud.id_solicitudes.toString().includes(query) ||
      solicitud.nombre.toLowerCase().includes(query) ||
      solicitud.correo.toLowerCase().includes(query)
    );
  });

  // Dividir las solicitudes en páginas
  const offset = currentPage * solicitudesPorPagina;
  const currentSolicitudes = solicitudesFiltradas.slice(
    offset,
    offset + solicitudesPorPagina
  );

  return (
    <div className="bg-colorGrispalido min-h-screen p-4 flex justify-center">
      <div className="bg-white shadow-xl rounded-xl p-6 max-w-full w-full mx-auto">
        <h2 className="text-4xl font-bold text-textHeader mb-8 text-center">
          Gestión de Convenios
        </h2>

        {/* Campo de búsqueda */}
        <div className="relative mb-8 w-full flex justify-center">
          <input
            type="text"
            placeholder="Buscar por ID, Usuario o Correo"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-3/4 p-4 pl-10 text-lg text-blue-950 font-medium bg-white border border-yellow-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[rgb(212,175,55)]"
          />
          <Icon
            icon="mdi:magnify"
            width="24"
            height="24"
            className="absolute left-14 top-1/2 transform -translate-y-1/2 text-textDorado"
          />
        </div>

        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-blue-50 rounded-lg">
            <thead>
              <tr className="bg-colorHeader text-textGrispalido">
                <th className="py-3 px-5 text-xl font-semibold text-center">
                  ID
                </th>
                <th className="py-3 px-5 text-xl font-semibold text-center">
                  Usuario
                </th>
                <th className="py-3 px-5 text-xl font-semibold text-center">
                  Correo
                </th>
                <th className="py-3 px-5 text-xl font-semibold text-center">
                  Fecha de Creación
                </th>
                <th className="py-3 px-5 text-xl font-semibold text-center">
                  Fecha de Finalización
                </th>
                <th className="py-3 px-5 text-xl font-semibold text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {currentSolicitudes.map((solicitud: any, index) => (
                <tr
                  key={solicitud.id_solicitudes}
                  className={`transition duration-200 hover:bg-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-4 px-5 text-xl text-center text-black">
                    {solicitud.id_solicitudes}
                  </td>
                  <td className="py-4 px-5 text-xl text-center text-black">
                    {solicitud.nombre} {solicitud.apellido}
                  </td>
                  <td className="py-4 px-5 text-xl text-center text-blue-500">
                    {solicitud.correo}
                  </td>
                  <td className="py-4 px-5 text-xl text-center text-black">
                    {new Date(solicitud.fecha_creacion).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-5 text-xl text-center text-black">
                    {solicitud.fecha_finalizacion
                      ? new Date(
                          solicitud.fecha_finalizacion
                        ).toLocaleDateString()
                      : "Pendiente"}
                  </td>
                  <td className="py-4 px-5 text-xl text-center flex items-center justify-center">
                    <button
                      className="text-blue-600 hover:text-blue-400"
                      onClick={() => openModal(solicitud)}
                    >
                      <Icon icon="lucide:eye" width="28" height="28" />
                    </button>

                    <button
                      className={`ml-2 ${
                        solicitud.fecha_finalizacion
                          ? "cursor-no-drop text-green-500"
                          : "text-gray-500"
                      }`}
                      onClick={() =>
                        finalizarSolicitud(solicitud.id_solicitudes)
                      }
                      disabled={solicitud.fecha_finalizacion ? true : false} // Deshabilitar si está finalizado
                    >
                      <Icon
                        icon="lucide:circle-check-big"
                        width="24"
                        height="24"
                      />
                    </button>

                    <button
                      className="text-red-500 ml-2"
                      onClick={() => openConfirmationModal(solicitud)}
                    >
                      <Icon icon="lucide:trash" width="24" height="24" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>

        {/* Paginación */}
        <ReactPaginate
          previousLabel={"Anterior"}
          nextLabel={"Siguiente"}
          breakLabel={"..."}
          pageCount={Math.ceil(
            solicitudesFiltradas.length / solicitudesPorPagina
          )}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName={"flex justify-center mt-10 space-x-3"}
          pageLinkClassName="px-6 py-3 rounded-full text-lg text-gray-700 border border-gray-300 hover:bg-colorDorado hover:text-textGrispalido"
          activeLinkClassName="bg-colorDorado text-textGrispalido border-none"
        />

        {/* Modal de detalles */}
        <Modal
          solicitud={selectedSolicitud}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />

        {/* Modal de confirmación */}
        <ConfirmacionModal
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirm={confirmarEliminacion}
          mensaje="¿Desea eliminar esta solicitud? Todos los datos se eliminarán. Asegúrate de que realmente deseas eliminarla."
        />
      </div>
    </div>
  );
};

export default GestionConvenios;

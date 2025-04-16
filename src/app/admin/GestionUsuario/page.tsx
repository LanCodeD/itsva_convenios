"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ModalUsuario from "./ModalUsuario"; // Asegúrate de que la ruta sea correcta
import { Icon } from "@iconify/react";
import ReactPaginate from "react-paginate"; // Importar la librería de paginación
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar el modal de detalles
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null); // Usuario seleccionado
  const [searchQuery, setSearchQuery] = useState(""); // Estado para la búsqueda
  const [currentPage, setCurrentPage] = useState(0); // Página actual para la paginación
  const { data: session, status } = useSession(); // Obtener la sesión
  const router = useRouter(); // Inicializar useRouter
  const usuariosPorPagina = 10; // Número de usuarios por página

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchUsuarios = async () => {
        try {
          const response = await axios.get(
            "/api/auth/signup/usuario/usuarioAll"
          ); // Asegúrate de que este sea el path correcto
          const data = await response.data;
          //console.log("envia data", data);
          setUsuarios(data);
        } catch (error) {
          console.error("Error al obtener usuarios:", error);
        }
      };

      fetchUsuarios();
    } else if (status === "unauthenticated") {
      // Redirigir si el usuario no está autenticado
      router.push("/login");
    }
  }, [session, status, router]);

  // Función para abrir el modal con el usuario seleccionado
  const openModal = (usuario: any) => {
    setSelectedUsuario(usuario); // Guardar el usuario seleccionado
    setIsOpen(true); // Abrir el modal
  };

  // Función para manejar el cambio de página en la paginación
  const handlePageChange = (selected: { selected: number }) => {
    setCurrentPage(selected.selected);
  };

  // Función para filtrar los usuarios basado en el input de búsqueda
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const query = searchQuery.toLowerCase();
    return (
      usuario.id_usuario.toString().includes(query) ||
      usuario.nombre.toLowerCase().includes(query) ||
      usuario.apellido.toLowerCase().includes(query) ||
      usuario.correo.toLowerCase().includes(query) 
    );
  });

  // Dividir los usuarios en páginas
  const offset = currentPage * usuariosPorPagina;
  const currentUsuarios = usuariosFiltrados.slice(
    offset,
    offset + usuariosPorPagina
  );

  return (
    <div className="bg-colorGrispalido min-h-screen p-4 flex justify-center">
    <div className="bg-white shadow-xl rounded-xl p-6 max-w-full w-full mx-auto">
      <h2 className="text-4xl font-bold text-textHeader mb-8 text-center">Gestión de Usuarios</h2>
  
      {/* Campo de búsqueda */}
      <div className="relative mb-8 w-full flex justify-center">
        <input
          type="text"
          placeholder="Buscar por ID, Nombre o Correo"
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
  
      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full bg-blue-50 rounded-lg">
          <thead>
            <tr className="bg-colorHeader text-textGrispalido">
              <th className="py-3 px-5 text-xl font-semibold text-center">ID</th>
              <th className="py-3 px-5 text-xl font-semibold text-center">Nombre</th>
              <th className="py-3 px-5 text-xl font-semibold text-center">Correo</th>
              <th className="py-3 px-5 text-xl font-semibold text-center">Rol</th>
              <th className="py-3 px-5 text-xl font-semibold text-center">Perfil</th>
            </tr>
          </thead>
          <tbody>
            {currentUsuarios.map((usuario, index) => (
              <tr key={usuario.id_usuario} className={`transition duration-200 hover:bg-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="py-4 px-5 text-xl text-center text-black">{usuario.id_usuario}</td>
                <td className="py-4 px-5 text-xl text-center text-black">{usuario.nombre} {usuario.apellido}</td>
                <td className="py-4 px-5 text-xl text-center text-blue-500">{usuario.correo}</td>
                <td className="py-4 px-5 text-xl text-center text-black capitalize">{usuario.rol}</td>
                <td className="py-4 px-5 text-xl text-center">
                  <button onClick={() => openModal(usuario)} className="text-blue-600 hover:text-blue-400">
                    <Icon icon="lucide:eye" width="28" height="28" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* Paginación */}
      <ReactPaginate
        previousLabel={"Anterior"}
        nextLabel={"Siguiente"}
        breakLabel={"..."}
        pageCount={Math.ceil(usuariosFiltrados.length / usuariosPorPagina)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageChange}
        containerClassName={"flex justify-center mt-10 space-x-3"}
        pageLinkClassName="px-6 py-3 rounded-full text-lg text-gray-700 border border-gray-300 hover:bg-colorDorado hover:text-textGrispalido"
        activeLinkClassName="bg-colorDorado text-textGrispalido border-none"
      />
  
      {/* Modal */}
      <ModalUsuario
        usuario={selectedUsuario}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  </div>
  
  );
};

export default GestionUsuarios;

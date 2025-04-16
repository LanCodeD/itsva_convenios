"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";

interface Perfil {
  informacion: string;
  ciudad: string;
  clave_o_matricula: string;
  numero_telefonico: string;
  foto_perfil?: string;
}

const Perfil = () => {
  const { data: session, status } = useSession();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id)  {
      const fetchPerfil = async () => {
        try {
          const userId = session.user.id;
          const response = await axios.get(`/api/auth/perfil`);
          setPerfil(response.data.perfil);
        } catch (error) {
          setError("No se pudieron obtener los datos del perfil");
          console.error(error);
        }
      };

      fetchPerfil();
    }else if (status === "unauthenticated") {
      // Redirigir si el usuario no está autenticado
      router.push("/login");
    }
  }, [session, status, router]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!perfil) {
    return <p></p>;
  }

  return (
    <div className="max-w-full w-full h-auto mx-auto p-5">
      <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center md:flex-row md:items-start">
        {/* Sección de imagen de perfil */}
        <div className="md:w-1/3 flex flex-col items-center mb-8 md:mb-0">
          {perfil.foto_perfil && (
            <img
              src={perfil.foto_perfil}
              alt="Foto de perfil"
              className="rounded-full w-72 h-72 object-cover mb-4 shadow-md transition-transform transform hover:scale-105 animate-fade-in"
            />
          )}
          <h3 className="text-4xl font-semibold text-gray-800">{session?.user?.name}</h3>
          <p className="text-xl text-gray-500">{session?.user?.role}</p>
          <Link
            href="/editarPerfil"
            className="mt-6 px-6 py-2 bg-colorDorado text-white text-lg font-medium rounded-lg hover:bg-yellow-500 flex items-center transition duration-300"
          >
            <Icon icon="lucide:user-cog" width="18" height="18" className="mr-2" />
            Editar perfil
          </Link>
        </div>
  
        {/* Sección de detalles del perfil */}
        <div className="md:w-2/3 space-y-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Detalles de Usuario</h2>
          <div className="text-lg text-gray-700 space-y-6">
            <p className="text-xl text-gray-700 ">
              <strong className="font-semibold text-gray-900 text-2xl">Información:</strong> {perfil.informacion}
            </p>
            <p className="text-xl text-gray-700 ">
              <strong className="font-semibold text-gray-900 text-2xl">Ciudad:</strong> {perfil.ciudad}
            </p>
            <p className="text-xl text-gray-700">
              <strong className="font-semibold text-gray-900 text-2xl">Clave/Matrícula:</strong> {perfil.clave_o_matricula}
            </p>
            <p className="text-xl text-gray-700 ">
              <strong className="font-semibold text-gray-900 text-2xl">Número Telefónico:</strong> {perfil.numero_telefonico}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default Perfil;

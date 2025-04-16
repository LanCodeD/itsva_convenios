"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import Image from "next/image";

interface Perfil {
  informacion: string;
  ciudad: string;
  clave_o_matricula: string;
  numero_telefonico: string;
  foto_perfil?: string;
}

const EditarPerfil = () => {
  const { data: session, status } = useSession();
  const [perfil, setPerfil] = useState<Perfil>({
    informacion: "",
    ciudad: "",
    clave_o_matricula: "",
    numero_telefonico: "",
    foto_perfil: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoArchivo, setFotoArchivo] = useState<File | null>(null); // Archivo de la foto
  const [uploading, setUploading] = useState<boolean>(false); // Estado de carga
  const [progress, setProgress] = useState<number>(0); // Estado de progreso
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchPerfil = async () => {
        try {
          const response = await axios.get(`/api/auth/perfil`);
          setPerfil(response.data.perfil);
          setFotoPreview(response.data.perfil.foto_perfil);
        } catch (error) {
          setError("No se pudieron obtener los datos del perfil");
          console.error(error);
        }
      };

      fetchPerfil();
    } else if (status === "unauthenticated") {
      // Redirigir si el usuario no está autenticado
      router.push("/login");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (session && session.user && perfil) {
      try {
        let fotoUrl = perfil.foto_perfil;

        if (fotoArchivo) {
          setUploading(true);

          const formData = new FormData();
          formData.append("file", fotoArchivo);
          formData.append("upload_preset", "fotoperfil");
          formData.append("cloud_name", "dce75mcva");

          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/dce75mcva/image/upload`,
            formData,
            {
              onUploadProgress: (progressEvent) => {
                const total = progressEvent.total || 1;
                const percent = Math.round((progressEvent.loaded / total) * 100);
                setProgress(percent); // Actualizar progreso
              },
            }
          );

          fotoUrl = response.data.secure_url;
          setUploading(false);
          setProgress(0); // Resetear progreso
        }

        const perfilFormData = new FormData();
        perfilFormData.append("informacion", perfil.informacion || "");
        perfilFormData.append("ciudad", perfil.ciudad || "");
        perfilFormData.append("clave_o_matricula", perfil.clave_o_matricula || "");
        perfilFormData.append("numero_telefonico", perfil.numero_telefonico || "");
        perfilFormData.append("foto_perfil", fotoUrl || "");

        await axios.put(`/api/auth/perfil`, perfilFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        router.push("/profile");
      } catch (error) {
        console.error(error);
        setUploading(false);
        setError("No se pudo actualizar el perfil. Inténtalo de nuevo.");
      }
    }
  };


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPerfil({ ...perfil, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFotoArchivo(e.target.files[0]);
    }
  };


  if (error) {
    return <p>{error}</p>;
  }

  if (status === "loading") {
    return <p>Cargando...</p>;
  }

  if (!perfil) {
    return <p>Cargando...</p>;
  }
  return (
    <div className="max-w-full w-full mx-auto p-5 mt-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center ">
        Editar Perfil
      </h2>
      <div className="flex flex-col items-center mb-6">
        {fotoPreview && (
          <Image
            src={fotoPreview}
            alt="Foto de perfil"
            width={200}
            height={200}
            className="rounded-full object-cover mb-4 shadow-md hover:scale-105 transition-transform"
          />
        )}

      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Campo Información */}
        <div>
          <label className="block text-xl font-medium text-gray-700 mb-2">
            Información
          </label>
          <div className="relative">
            <input
              type="text"
              name="informacion"
              value={perfil.informacion}
              onChange={handleInputChange}
              className="w-full block text-lg bg-white border border-gray-300 rounded-md p-3 pl-10 mt-2 text-blue-950 focus:outline-none focus:ring-2 focus:ring-[rgb(212,175,55)]"
              placeholder="Escribe tu información"
            />
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Icon icon="lucide:info" width="20" height="20" />
            </span>
          </div>
        </div>

        {/* Campo Ciudad */}
        <div>
          <label className="block text-xl font-medium text-gray-700 mb-2">
            Ciudad
          </label>
          <div className="relative">
            <input
              type="text"
              name="ciudad"
              value={perfil.ciudad}
              onChange={handleInputChange}
              className="w-full block text-lg bg-white border border-gray-300 rounded-md p-3 pl-10 mt-2 text-blue-950 focus:outline-none focus:ring-2 focus:ring-[rgb(212,175,55)]"
              placeholder="Ciudad de residencia"
            />
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Icon icon="lucide:map-pin" width="20" height="20" />
            </span>
          </div>
        </div>

        {/* Campo Clave/Matrícula */}
        <div>
          <label className="block text-xl font-medium text-gray-700 mb-2">
            Clave/Matrícula
          </label>
          <div className="relative">
            <input
              type="text"
              name="clave_o_matricula"
              value={perfil.clave_o_matricula}
              onChange={handleInputChange}
              className="w-full block text-lg bg-white border border-gray-300 rounded-md p-3 pl-10 mt-2 text-blue-950 focus:outline-none focus:ring-2 focus:ring-[rgb(212,175,55)]"
              placeholder="Clave o matrícula"
            />
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Icon icon="lucide:hash" width="20" height="20" />
            </span>
          </div>
        </div>

        {/* Campo Número Telefónico */}
        <div>
          <label className="block text-xl font-medium text-gray-700 mb-2">
            Número Telefónico
          </label>
          <div className="relative">
            <input
              type="text"
              name="numero_telefonico"
              value={perfil.numero_telefonico}
              onChange={handleInputChange}
              className="w-full block text-lg bg-white border border-gray-300 rounded-md p-3 pl-10 mt-2 text-blue-950 focus:outline-none focus:ring-2 focus:ring-[rgb(212,175,55)]"
              placeholder="Número de contacto"
            />
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Icon icon="lucide:phone" width="20" height="20" />
            </span>
          </div>
        </div>

        {/* Foto de Perfil */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Escoge Una Foto De Perfil
          </label>
          <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 block w-3/4 text-sm text-gray-500 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {uploading && (
          <div className="mt-2 w-3/4 bg-gray-200 rounded-full">
            <div
              className="bg-indigo-600 text-xs leading-none py-1 text-center text-white rounded-full"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        )}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        </div>

        

        {/* Botón Guardar Cambios */}
        <div className="md:col-span-2 flex justify-center mt-4">
          <button
            type="submit"
            className="bg-colorDorado hover:bg-yellow-500 text-white font-bold py-3 px-4 flex items-center rounded-lg shadow-lg transition duration-300"
          >
            <Icon icon="lucide:save" width="18" height="18" className="mr-2" />
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarPerfil;


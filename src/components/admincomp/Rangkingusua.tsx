import axios from "axios";
import useSWR from "swr";
import Image from "next/image";

// Tipo para el usuario
interface Usuario {
  nombre: string;
  apellido: string;
  correo: string;
  totalSolicitudes: number;
  foto_perfil: string;
}

// Fetcher function para usar con SWR
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const RankingUsuarios: React.FC = () => {
  const { data, error } = useSWR("/api/auth/signup/usuario", fetcher);

  if (error) return <div>Error al cargar el ranking</div>;
  if (!data) return <div>Cargando ranking...</div>;

  // Filtrar los 5 usuarios más activos
  const topUsuarios = data.slice(0, 6);

  return (
    <div className="bg-white shadow-lg rounded-sm size-full relative">
      <div className="relative bg-[#556B2F] rounded-t-lg h-20 text-center">
        <h2 className="p-5 text-2xl font-semibold mb-1 text-white">
          Usuarios Activos
        </h2>
      </div>
      <div className="p-6 space-y-6 ">
        {/* Lista de los usuarios más activos */}
        <div className="space-y-4 ">
          {topUsuarios.map((usuario: Usuario, index: number) => (
            <div
              key={index}
              className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg shadow-md justify-between"
            >
              {/* Foto de perfil del usuario */}
              <div className="relative flex">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={
                      usuario?.foto_perfil ||
                      "/resource/image/default-profile.png"
                    }
                    alt={`${usuario.nombre} ${usuario.apellido}`}
                    fill
                    sizes="500px"
                    className="object-cover rounded-full"
                  />
                </div>
              </div>

              {/* Detalles del usuario */}
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-800">
                  {usuario.nombre} {usuario.apellido}
                </h3>
                <p className="text-sm text-blue-400 ">{usuario.correo}</p>
              </div>

              {/* Total de solicitudes enviadas */}
              <div className="text-right">
                <p className="text-sm text-gray-700">Solicitudes enviadas:</p>
                <p className="text-lg font-bold text-[rgb(188,149,90)]">
                  {usuario.totalSolicitudes}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RankingUsuarios;

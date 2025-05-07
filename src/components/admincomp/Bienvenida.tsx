import useSWR from "swr";
import axios from "axios";
import { Session } from "next-auth";
import Image from "next/image";

// Define el tipo para las props del componente
interface BienvenidaProps {
  user: Session["user"];
}

// Fetcher function para usar con SWR
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const Bienvenida: React.FC<BienvenidaProps> = ({ user }) => {
  // Utiliza SWR para caché automático
  const { data, error } = useSWR(`/api/auth/perfil`, fetcher);

  if (error) return <div>Error al cargar el perfil</div>;
  if (!data) return <div>Cargando perfil...</div>;

  // Accede a 'perfil' dentro del objeto devuelto
  const perfil = data.perfil;

  // Foto de perfil, si no existe usa la predeterminada
  const fotoPerfil =
    perfil?.foto_perfil || "/resource/image/default-profile.png";

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-md">
      <div className="absolute inset-0 bg-[#556B2F] rounded-t-lg h-20 text-center">
        <h2 className="p-2 text-2xl font-semibold mb-1 text-white">
          ¡Bienvenido de Nuevo!
        </h2>
      </div>

      <div className="relative flex mt-4 items-center justify-center">
        <div className="relative mt-4 w-20 h-20 sm:w-20 sm:h-20 flex items-center justify-center mr-4 border-4 border-gray-200 rounded-full overflow-hidden">
          <Image
            src={fotoPerfil}
            alt="Profile"
            fill
            sizes="800px"
            className="object-cover rounded-full"
          />
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg text-black font-semibold">{user.name}</h3>
        <p className="text-sm text-blue-400">{user.email}</p>
        <p className="text-sm text-textDorado font-semibold">{user.role}</p>
      </div>
    </div>
  );
};

export default Bienvenida;

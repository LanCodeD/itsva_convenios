"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Estadisticas from "@/components/estadisticas";
import EstadisticasUsuarios from "@/components/admincomp/EstadisticasUsuario";
import Bienvenida from "@/components/admincomp/Bienvenida";
import Calendario from "@/components/admincomp/Calendario";
import RankingUsuarios from "@/components/admincomp/Rangkingusua";


const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession(); // Aquí añadimos `status`

  useEffect(() => {
    const fetchUserRole = async () => {
      const response = await axios.get("/api/auth/check-role");
      const data = await response.data;

      if (data.rol === "administrador") {
        setIsAdmin(true);
      } else {
        router.push("/dashboard");
      }
    };

    fetchUserRole();
  }, [router]);

  if (!isAdmin || status === "loading") {
    // Verifica que esté cargando la sesión
    return <p>Cargando...</p>;
  }

  return (
    
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 flex flex-col space-y-4">
        {/* Forzamos que la bienvenida y el calendario estén en la misma columna */}
        {session && session.user && <Bienvenida user={session.user} />}
        <Calendario />
        {/* Ahora, el calendario sube justo debajo de la bienvenida */}
      </div>

      <div className="lg:col-span-2">
        <Estadisticas />
      </div>

      <div className="lg:col-span-2">
        <EstadisticasUsuarios />
      </div>

      <div className="lg:col-span-1">
        <RankingUsuarios />
      </div>
    </div>
  );
};

export default AdminPage;




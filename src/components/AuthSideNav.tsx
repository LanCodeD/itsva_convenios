"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import SideNav from "@/components/side-nav";
import MarginWidthWrapper from "@/components/margin-width-wrapper";
import Header from "@/components/header";
import HeaderMobile from "@/components/header-mobile";
import PageWrapper from "@/components/page-wrapper";

export default function AuthSideNav({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Detecta cuando el estado pasa de "loading" a "authenticated" para mostrar la pantalla de "Ingresando"
    if (status === "authenticated") {
      setIsLoggingIn(true);
      setTimeout(() => {
        setIsLoggingIn(false);
      }, 1000); // Retraso de 1 segundo
    }
  }, [status]);

  // Mostrar pantalla de carga "Ingresando a la plataforma..." solo al loguearse
  if (isLoggingIn || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500 mt-4"></div>
      </div>
    );
  }

  // Si no está autenticado, renderiza solo el children (página de login)
  if (!session) return <>{children}</>;

 // Obtenemos el rol del usuario de la sesión (por defecto, es 'user')
 const userRole = session?.user?.role || "usuario";

 // Si está autenticado, renderiza el SideNav y el resto de la estructura
 return (
   <div className="flex">
    <SideNav role={userRole} onCollapse={setIsCollapsed} />
     <main className="flex-1">
       <MarginWidthWrapper isCollapsed={isCollapsed}>
         <Header />
         <HeaderMobile role={userRole}/>
         <PageWrapper>{children}</PageWrapper>
       </MarginWidthWrapper>
     </main>
   </div>
 );
}
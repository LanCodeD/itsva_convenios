"use client";
import { Icon } from "@iconify/react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Contactar = () => {
  const { data: session, status } = useSession();

  const router = useRouter();

  //Cerrar bien la sesión
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
    } else if (status === "unauthenticated") {
      // Redirigir si el usuario no está autenticado
      router.push("/login");
    }
  }, [session, status, router]);

  return (
    <div className="container w-full max-w-full h-auto bg-white mx-auto px-6 py-5 mt-4 rounded-xl">
      {/* Sección Acerca de Nosotros */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Acerca de Nosotros
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
          El Tecnológico Nacional de México Campus Valladolid es una institución
          pública de educación superior que forma parte de la familia TECNM que
          comprende 254 tecnológicos en todo el país.
        </p>
      </div>

      {/* Sección Contacto */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Información de Contacto */}
        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Valladolid Yucatán
          </h3>
          <div className="flex items-start gap-4 mb-4">
            <span className="text-orange-500">
              <Icon icon="lucide:map-pin" width="30" height="30" />
            </span>
            <p className="text-gray-800 text-lg">
              Carretera Valladolid - Tizimin Km 3.5 Tablaje Catastral No. 8850,
              97780 Valladolid, Yuc.
            </p>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-orange-500">
              <Icon icon="lucide:message-circle-more" width="30" height="30" />
            </span>
            <p className="text-gray-800 text-lg">+529858566300</p>
          </div>
        </div>
      </div>
      {/* Mapa */}
      <div className="flex-1 pt-4">
        <iframe
          className="w-full h-64 rounded-lg shadow-lg"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12552.374926166718!2d-88.1978215785964!3d20.716583084977916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f51753cba5563b1%3A0x6db3c1d1f4477b05!2sTecNM%20-%20Instituto%20Tecnologico%20Superior%20de%20Valladolid!5e0!3m2!1ses!2smx!4v1730831689893!5m2!1ses!2smx"
          allowFullScreen={true}
          aria-hidden="false"
          tabIndex={0}
        ></iframe>
      </div>
    </div>
  );
};
export default Contactar;

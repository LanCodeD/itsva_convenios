"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import useScroll from "@/hooks/use-scroll";
import { cn } from "@/libs/utils";
import { signOut, useSession } from "next-auth/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import NotificationIcon from "./NotificionIcon";
import useSWR from "swr";
import Image from "next/image";

const Header = () => {
  const scrolled = useScroll(40);
  const selectedLayout = useSelectedLayoutSegment();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  //const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true); // Estado para notificaciones no leídas

  // Lógica para actualizar el estado de las notificaciones cuando se leen
  const handleReadNotifications = () => {
    setHasUnreadNotifications(false); // Actualiza el estado de notificaciones
  };

  // Fetcher function para usar con SWR
  const fetcher = (url: string) => axios.get(url).then((res) => res.data);

  const { data, error } = useSWR(`/api/auth/perfil`, fetcher);
  if (error) return <div>Error al cargar el perfil</div>;
  if (!data) return <div>Cargando perfil...</div>;

  // Accede a 'perfil' dentro del objeto devuelto
  const perfil = data.perfil;

  // Foto de perfil, si no existe usa la predeterminada
  const fotoPerfil =
    perfil?.foto_perfil || "/resource/image/default-profile.png";

  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-30 w-full transition-all duration-500 ease-in-out `, // Duración más larga para suavizar la transición
        {
          "bg-colorHeader bg-opacity-100 shadow-md": !scrolled,
          "bg-colorHeader bg-opacity-95 backdrop-opacity-30 backdrop-blur-lg shadow-sm":
            scrolled, // Transición más suave de opacidad
        }
      )}
    >
      <div className="flex h-[70px] items-center justify-between w-full px-10">
        <div className="flex items-center space-x-4">
          <Link
            href="https://www.itsva.edu.mx"
            target="_blank"
            className="flex flex-row space-x-3 items-center justify-center md:hidden"
          >
            <div className="h-7 w-7 bg-colorHeader rounded-lg flex items-center justify-center relative">
              <Image
                src="/resource/image/B_ITSVA.png"
                alt="Logo"
                fill
                sizes="30px"
                className="object-contain"
              />
            </div>

            <div className="flex items-center space-x-2 justify-center relative h-24 w-24 max-h-10 max-w-full ">
              <Image
                src="/resource/image/B_ITSVA2.png"
                alt="Logo Itsva Letras"
                fill
                sizes="100px"
                className="object-contain"
              />
            </div>
          </Link>
        </div>

        <div className="relative hidden md:block">
          <div
            className="relative flex items-center"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <NotificationIcon
              hasUnread={hasUnreadNotifications}
              onRead={handleReadNotifications}
            />

            {/* Imagen de perfil */}
            <div className="h-14 w-14 rounded-full bg-gray-200 overflow-hidden relative">
              <Image
                src={fotoPerfil || "/resource/image/default-profile.png"}
                alt="Perfil"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>

            {/* Mostrar el círculo rojo de notificaciones no leídas */}
            {hasUnreadNotifications && <></>}
          </div>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <Link
                href="/profile"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={() => setMenuOpen(false)} // Cierra el menú al hacer clic
              >
                <Icon
                  icon="lucide:user"
                  width="14"
                  height="14"
                  className="mr-2"
                />
                Perfil
              </Link>

              <Link
                href="/Notificacion"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center "
                onClick={() => setMenuOpen(false)} // Cierra el menú al hacer clic
              >
                <NotificationIcon
                  hasUnread={hasUnreadNotifications}
                  onRead={handleReadNotifications}
                />
                <Icon
                  icon="lucide:bell"
                  width="14"
                  height="14"
                  className="mr-2"
                />
                Notificaciones
              </Link>
              <button
                onClick={() => signOut()}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Icon
                  icon="lucide:log-out"
                  width="14"
                  height="14"
                  className="mr-2"
                />
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDENAV_ITEMS, ADMIN_SIDENAV_ITEMS } from "@/constans";
import { SideNavItem } from "@/types";
import { Icon } from "@iconify/react";

const SideNav = ({
  role,
  onCollapse,
}: {
  role: string;
  onCollapse: (isCollapsed: boolean) => void;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false); // Estado para controlar el colapso
  const sideNavItems =
    role === "administrador" ? ADMIN_SIDENAV_ITEMS : SIDENAV_ITEMS;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onCollapse(!isCollapsed); // Notificar al componente padre sobre el estado colapsado
  };

  return (
    <div
      className={`${
        isCollapsed ? "md:w-20" : "md:w-60"
      } bg-colorSideNav h-screen flex-1 fixed hidden border-none  md:flex transition-all duration-300 `}
    >
      <div className="flex flex-col space-y-6 w-full border-none">
        <Link
          href="https://www.itsva.edu.mx"
          target="_blank"
          className={`flex flex-row space-x-1 items-center justify-center bg-colorHeader ${
            isCollapsed ? "md:px-3" : "md:px-6"
          } h-[70px] w-full`}
        >
          {/* Imagen primaria */}
          <div className="h-10 w-10 bg-colorHeader flex items-center justify-center">
            <img
              src="/resource/image/B_ITSVA.png"
              alt="Logo Itsva"
              className="h-full w-full  object-contain"
            />
          </div>

          {/* Imagen secundaria y texto, solo cuando el SideNav está expandido */}
          {!isCollapsed && (
            <div className="flex items-center space-x-2 justify-center">
             
              <img
                src="/resource/image/B_ITSVA2.png" // Cambia esta ruta a la de tu segunda imagen
                alt="Logo Itsva Letras"
                className="h-auto w-auto max-h-10 max-w-full object-contain"
              />
            </div>
          )}
        </Link>

        <div className="flex flex-col space-y-5 md:px-4 ">
          {sideNavItems.map((item, idx) => {
            return <MenuItem key={idx} item={item} isCollapsed={isCollapsed} />;
          })}
        </div>

        {/* Botón de colapso */}
        <button
          onClick={toggleCollapse}
          className="absolute bottom-4 left-4 text-white flex items-center justify-center w-10 h-10 bg-colorDorado rounded-full shadow-md hover:bg-[#4E4E4E]"
        >
          <Icon
            icon={isCollapsed ? "lucide:chevron-right" : "lucide:chevron-left"}
            width="24"
            height="24"
          />
        </button>
      </div>
    </div>
  );
};

export default SideNav;

const MenuItem = ({
  item,
  isCollapsed,
}: {
  item: SideNavItem;
  isCollapsed: boolean;
}) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  const toggleSubMenu = () => setSubMenuOpen(!subMenuOpen);
  const handleClick = () => {
    if (item.onClick) item.onClick();
  };

  const isMenuActive = () => {
    if (pathname === item.path) return true;
    if (item.subMenuItems) {
      return item.subMenuItems.some((subItem) =>
        pathname.startsWith(subItem.path)
      );
    }
    return false;
  };

  const isActive = isMenuActive();

  return (
    <div>
      {item.submenu ? (
        <>
          <button
            onClick={toggleSubMenu}
            className={`flex items-center p-2 rounded-lg w-full justify-between font-semibold ${
              isActive
              ? "bg-colorDorado text-[rgb(27,57,106)]"
              : "hover:bg-colorDorado"
          }`}
          >
            {/* Ajusta el tamaño del icono para ambos estados (colapsado/expandido) */}
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center w-full" : "space-x-2"
              }`}
            >
              {item.icon && (
                <span className="flex items-center justify-center">
                  {React.cloneElement(item.icon, {
                    width: isCollapsed ? 20 : 24,
                    height: isCollapsed ? 20 : 24,
                  })}
                </span>
              )}
              {!isCollapsed && (
                <span className="font-semibold text-xl"> {item.title}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className={`${subMenuOpen ? "rotate-180" : ""} flex`}>
                <Icon icon="lucide:chevron-down" width="24" height="24" />
              </div>
            )}
          </button>
          {subMenuOpen && !isCollapsed && (
            <div className="ml-8 flex flex-col font-bold">
              {item.subMenuItems?.map((subItem, idx) => (
                <Link key={idx} href={subItem.path}>
                  <span
                    className={`block p-2 m-2 rounded-lg ${
                      pathname === subItem.path
                        ? "bg-colorDorado text-[rgb(27,57,106)]"
                        : "hover:bg-colorDorado"
                    }`}
                  >
                    {subItem.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.path}
          className={`flex items-center p-3 rounded-lg ${
            isActive
              ? "bg-colorDorado text-textHeader"
              : "hover:bg-colorDorado"
          }`}
          onClick={item.onClick ? handleClick : undefined}
        >
          <div className="flex items-center space-x-2">
            {item.icon && (
              <span className="flex items-center justify-center">
                {React.cloneElement(item.icon, {
                  width: isCollapsed ? 20 : 24,
                  height: isCollapsed ? 20 : 24,
                })}
              </span>
            )}
            {!isCollapsed && (
              <span className="font-semibold text-xl"> {item.title}</span>
            )}
          </div>
        </Link>
      )}
    </div>
  );
};

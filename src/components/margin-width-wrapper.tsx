import { ReactNode } from "react";

export default function MarginWidthWrapper({
  children,
  isCollapsed,  // Recibe el estado colapsado
}: {
  children: ReactNode;
  isCollapsed: boolean;
}) {
  return (
    <div
      className={`flex flex-col transition-all duration-300 min-h-screen ${
        isCollapsed ? "md:ml-20" : "md:ml-60"
      } sm:border-r sm:border-zinc-700`}
    >
      {children}
    </div>
  );
}

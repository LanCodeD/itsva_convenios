"use client";
import { Dialog } from "@headlessui/react";
import Image from 'next/image';


type Usuario = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  informacion?: string;
  ciudad?: string;
  clave_o_matricula?: string;
  numero_telefonico?: string;
  foto_perfil?: string;
};

type ModalProps = {
  usuario: Usuario | null;
  isOpen: boolean;
  onClose: () => void;
};

const ModalUsuario = ({ usuario, isOpen, onClose }: ModalProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Fondo oscuro */}
      <div className="fixed inset-0 bg-black/25" aria-hidden="true" />

      {/* Contenido del modal centrado */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-gray-100 shadow-lg">
          {/* Encabezado del modal */}
          <div className="bg-guinda rounded-t-lg p-4 text-textGrispalido text-center">
            <Dialog.Title className="text-2xl font-semibold">
              Detalles del Usuario
            </Dialog.Title>
          </div>

          {/* Contenido del modal */}
          <div className="p-8 text-lg text-[#333333] space-y-6">
            {usuario ? (
              <>
                {/* Foto y Nombre */}
                <div className="flex items-center space-x-4">
                  {usuario.foto_perfil && (
                    <div className="w-24 h-24 relative">
                      <Image
                        src={usuario.foto_perfil}
                        alt="Foto de perfil"
                        fill
                        sizes="96px"
                        className="rounded-full border border-gray-300 object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {usuario.nombre} {usuario.apellido}
                    </p>
                    <p className="text-gray-600">{usuario.rol}</p>
                  </div>
                </div>

                {/* Información General */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-textSideNav">
                    Información General
                  </h3>
                  <p>
                    <strong>Correo:</strong> {usuario.correo}
                  </p>
                  <p>
                    <strong>Ciudad:</strong> {usuario.ciudad}
                  </p>
                </div>

                {/* Detalles Adicionales */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-textSideNav">
                    Detalles Adicionales
                  </h3>
                  <p>
                    <strong>ID Usuario:</strong> {usuario.id_usuario}
                  </p>
                  {usuario.informacion && (
                    <p>
                      <strong>Información:</strong> {usuario.informacion}
                    </p>
                  )}
                  {usuario.clave_o_matricula && (
                    <p>
                      <strong>Clave o Matrícula:</strong>{" "}
                      {usuario.clave_o_matricula}
                    </p>
                  )}
                  {usuario.numero_telefonico && (
                    <p>
                      <strong>Número Telefónico:</strong>{" "}
                      {usuario.numero_telefonico}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">
                Cargando información...
              </p>
            )}

            {/* Botón de cierre */}
            <div className="mt-8 flex justify-center">
              <button
                className="bg-colorDorado text-white text-lg px-6 py-3 rounded-full hover:bg-yellow-500"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ModalUsuario;

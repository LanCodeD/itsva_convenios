"use client";
import { Dialog } from '@headlessui/react';

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mensaje: string;
};

const ConfirmacionModal = ({ isOpen, onClose, onConfirm, mensaje }: ConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Fondo oscuro */}
      <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
  
      {/* Contenido del modal centrado */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-gray-100 shadow-lg">
          {/* Encabezado del modal */}
          <div className="bg-guinda rounded-t-lg p-4 text-textGrispalido text-center">
            <Dialog.Title className="text-2xl font-semibold">Confirmación</Dialog.Title>
          </div>
  
          {/* Contenido del modal */}
          <div className="p-8 text-lg text-[#333333] text-center">
            <p>{mensaje}</p>
          </div>
  
          {/* Botones */}
          <div className="px-8 pb-8 flex justify-end gap-4">
            <button
              className="bg-colorDorado text-white px-6 py-3 rounded-full hover:bg-yellow-500"
              onClick={onConfirm}
            >
              Sí
            </button>
            <button
              className="bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-colorGrisOscuro"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
  
};

export default ConfirmacionModal;

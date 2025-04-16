import { useState } from "react";
import { Transition } from "@headlessui/react";
import { Icon } from "@iconify/react";

interface NotificationProps {
  message: string;
  type: "success" | "error"; // Tipos de notificación
  isOpen: boolean;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, isOpen, onClose }) => {
  const notificationColor =
    type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <Transition
      show={isOpen}
      enter="transform transition ease-in-out duration-300"
      enterFrom="translate-y-[-100%] opacity-0"
      enterTo="translate-y-0 opacity-100"
      leave="transform transition ease-in-out duration-300"
      leaveFrom="translate-y-0 opacity-100"
      leaveTo="translate-y-[-100%] opacity-0"
    >
      <div
        className={`${notificationColor} fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white flex items-center space-x-4`}
      >
        <Icon
          icon={type === "success" ? "akar-icons:circle-check" : "akar-icons:circle-alert"}
          className="w-6 h-6"
        />
        <span className="text-sm">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:bg-white hover:text-gray-800 rounded-full p-1"
        >
          ✕
        </button>
      </div>
    </Transition>
  );
};

export default Notification;

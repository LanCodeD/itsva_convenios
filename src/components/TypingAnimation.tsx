"use client";
import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';

const TypingAnimation = () => {
  const typedElement = useRef(null);

  useEffect(() => {
    const options = {
      strings: [
        'Bienvenido al Sistema de Convenios...',
        'Solicita el documento',
        'Recibe notificaciones de estado',
        'Administra tus archivos fácilmente',
      ],
      typeSpeed: 30,
      backSpeed: 30,
      loop: true,
      backDelay: 1500,
      showCursor: true,
    };

    const typed = new Typed(typedElement.current, options);

    return () => {
      // Destruye la instancia al desmontar el componente
      typed.destroy();
    };
  }, []);

  return (
    <div className="text-center">
      <h1 className="text-6xl font-bold">
        <span ref={typedElement}></span>
      </h1>
    </div>
  );
};

export default TypingAnimation;

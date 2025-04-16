"use client";
import TypingAnimation from "@/components/TypingAnimation";


export default function Home() {
  return (
    <div className="flex flex-col items-center bg-white rounded-xl ">
      {/* Título Animado */}
      <div className="relative w-full h-[400px] mb-1">
        {/* Imagen de fondo */}
        <img
          src="/resource/image/inicio3.png"
          alt="Solicita el documento"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Título Animado */}
        <div className="relative flex items-center text-white justify-center h-full">
          <TypingAnimation />
        </div>
      </div>

      {/* Secciones de Pasos */}
      <div className="space-y-1 w-full max-w-full">
        {/* Paso 1 */}
        <div className="flex items-center bg-cyan-500 ">
          <div className="flex items-center w-full h-full bg-cyan-500">
            <img
              src="/resource/image/formu1.png"
              alt="Solicita el documento"
              className="max-w-xl w-full h-full max-h-[45vh] object-contain transition-transform transform hover:scale-95 animate-fade-in"
            />
          </div>
          <div className="text-center items-center justify-center w-full h-full ">
            <h2 className="text-5xl text-[#90F5FD] ml-6 leading-relaxed font-bold mb-3 transition-transform transform hover:scale-95 animate-fade-in">
              Paso #1
            </h2>
            <p className="text-2xl text-white ml-6 mr-4 leading-relaxed font-semibold transition-transform transform hover:scale-105 animate-fade-in">
              Dirígite al apartado de <strong>Servicios</strong> para agregar
              una nueva Solicitud.
            </p>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="flex items-center bg-white ">
          <div className="text-center items-center justify-center w-full h-full ">
            <h2 className="text-5xl text-[rgb(108,220,228)] ml-6 leading-relaxed font-bold mb-3 transition-transform transform hover:scale-95 animate-fade-in">
              Paso #2
            </h2>
            <p className="text-2xl text-gray-900 ml-6 mr-4 leading-relaxed font-semibold transition-transform transform hover:scale-105 animate-fade-in">
              Acompleta todos los campos que se te solicitan, Recuerda <strong>Descargar</strong> tu documento correspondiente para dicha solicitud.
            </p>
          </div>
          <div className="flex items-center w-full h-full bg-white">
            <img
              src="/resource/image/formu8.png"
              alt="Solicita el documento"
              className="max-w-xl w-full h-full max-h-[45vh] object-contain transition-transform transform hover:scale-95 animate-fade-in"
            />
          </div>
        </div>

        {/* Paso 3 */}
        <div className="flex items-center bg-orange-500 ">
          <div className="flex items-center w-full h-full bg-orange-500">
            <img
              src="/resource/image/formu6.png"
              alt="Solicita el documento"
              className="max-w-xl w-full h-full max-h-[45vh] object-contain transition-transform transform hover:scale-95 animate-fade-in"
            />
          </div>
          <div className="text-center items-center justify-center w-full h-full ">
            <h2 className="text-5xl text-[#90F5FD] ml-6 leading-relaxed font-bold mb-3 transition-transform transform hover:scale-95 animate-fade-in">
              Paso #3
            </h2>
            <p className="text-2xl text-white ml-6 mr-4 leading-relaxed font-semibold transition-transform transform hover:scale-105 animate-fade-in">
              Una vez terminado de acompletar los datos puedes verificarlos en el apartado de Servicios <strong>Historial</strong>. Espera respuesta del Administrador.
            </p>
          </div>
        </div>

        {/* Paso 4 */}
        <div className="flex items-center bg-white ">
          <div className="text-center items-center justify-center w-full h-full ">
            <h2 className="text-5xl text-[rgb(108,220,228)] ml-6 leading-relaxed font-bold mb-3 transition-transform transform hover:scale-95 animate-fade-in">
              Paso #4
            </h2>
            <p className="text-2xl text-gray-900 ml-6 mr-4 leading-relaxed font-semibold transition-transform transform hover:scale-105 animate-fade-in">
              Recibe <strong>Notifiaciones</strong> del estado de las secciones acompletadas, Verifica que estén en estado <strong>Aceptado</strong>.
            </p>
          </div>
          <div className="flex items-center w-full h-full bg-white">
            <img
              src="/resource/image/formu3.png"
              alt="Solicita el documento"
              className="max-w-xl w-full h-full max-h-[45vh] object-contain transition-transform transform hover:scale-95 animate-fade-in"
            />
          </div>
        </div>

        {/* Paso 5 */}
        <div className="flex items-center bg-guindaclaro ">
          <div className="flex items-center w-full h-full bg-guindaclaro">
            <img
              src="/resource/image/formu7.png"
              alt="Solicita el documento"
              className="max-w-xl w-full h-full max-h-[45vh] object-contain transition-transform transform hover:scale-95 animate-fade-in"
            />
          </div>
          <div className="text-center items-center justify-center w-full h-full ">
            <h2 className="text-5xl text-[#90F5FD] ml-6 leading-relaxed font-bold mb-3 transition-transform transform hover:scale-95 animate-fade-in">
              Paso #5
            </h2>
            <p className="text-2xl text-white ml-6 mr-4 leading-relaxed font-semibold transition-transform transform hover:scale-105 animate-fade-in">
             <strong>¡Listo!</strong> haz terminado tu proceso de solicitud de convenio.
            </p>
          </div>
        </div>

      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fade-in 1.5s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

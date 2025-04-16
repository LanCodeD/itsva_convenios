"use client";
import { FormEvent, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importa los íconos

function Registerpage() {
  const [error, setError] = useState();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar u ocultar la contraseña
  const router = useRouter();


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    try {
      const res = await axios.post("/api/auth/signup", {
        nombre: formData.get("nombre"),
        apellido: formData.get("apellido"),
        correo: formData.get("correo"),
        contraseña: formData.get("contraseña"),
        informacion: formData.get("informacion"),
        ciudad: formData.get("ciudad"),
        clave_o_matricula: formData.get("clave_o_matricula"),
        numero_telefonico: formData.get("numero_telefonico"),
      });

      // Mostrar el mensaje de éxito
      setSuccess(true);

      // Esperar 2 segundos antes de redirigir al login
      setTimeout(() => {
        router.push("/login");
      }, 2000);

      console.log(res);
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        setError(error.response?.data.message);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Alterna entre mostrar y ocultar la contraseña
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('/resource/image/alfa.jpg')",
      }}
    >
      
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">
          Registro
        </h1>

        {error && <div className="bg-red-500 text-white p-2 mb-4">{error}</div>}

        {success && (
          <div className="bg-green-500 text-white p-2 mb-4 text-center">
            Registro creado, redirigiendo al login...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            {/* Sección de campos obligatorios */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Datos Obligatorios
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Milo"
                    className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white"
                    name="nombre"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Patrón"
                    className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white"
                    name="apellido"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Correo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="ejemplo@dominio.com"
                    className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white"
                    name="correo"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-gray-700 font-bold mb-2">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white pr-10" // Asegúrate de agregar padding-right
                    name="contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700"
                    style={{ height: '49%', top: '47%' }}//Lo ajustamos manulamnete pero no es lo recomendable, lo recomendable es crear un div classname "relative"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Sección de campos no obligatorios */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Datos Opcionales
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Información
                  </label>
                  <input
                    type="text"
                    placeholder="Residencia"
                    className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white"
                    name="informacion"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    placeholder="Valladolid"
                    className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white"
                    name="ciudad"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Clave/Matrícula
                  </label>
                  <input
                    type="text"
                    placeholder="12345678"
                    className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white"
                    name="clave_o_matricula"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Número telefónico
                  </label>
                  <input
                    type="text"
                    placeholder="9998887777"
                    className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white"
                    name="numero_telefonico"
                  />
                </div>
              </div>
            </div>

            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-full">
              Registrar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Registerpage;

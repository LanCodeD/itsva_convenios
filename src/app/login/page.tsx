"use client";
import { FormEvent, useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";

function Loginpage() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const LoadingSpinner = () => {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
      </div>
    );
  };

  // 👇 Esta parte es nueva — limpia el callbackUrl si viene en la URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("callbackUrl")) {
      // Esto limpia la URL manteniéndote en /login, sin recargar
      router.replace("/login", undefined);
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true); // Mostrar el spinner carga animación

    const formData = new FormData(e.currentTarget);

    setError(""); // Limpiar errores previos

    const res = await signIn("credentials", {
      correo: formData.get("correo"),
      contraseña: formData.get("contraseña"),
      redirect: false, // Desactivar redirección automática
    });

    if (res?.error) {
      setLoading(false); // Ocultar el spinner si hay un error
      setError(res.error as string);
    } else if (res?.ok) {
      // Si la autenticación fue exitosa, obtenemos la sesión
      const session = await getSession();

      // Verificamos el rol del usuario en la sesión
      const userRole = session?.user?.role; // Asegúrate de que en el callback `session` se incluya el rol

      // Dependiendo del rol, redirigimos al usuario a la página correspondiente
      if (userRole === "administrador") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) return <LoadingSpinner />; // Mostrar el spinner durante la carga

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: "url('/resource/image/alfa.jpg')" }}
    >
      {/* Encabezado */}
      <header
        className="w-full bg-cover bg-center flex items-center px-6 py-1"
        style={{ backgroundImage: "url('/resource/image/azul4.webp')" }}
      >
        <Image
          src="/resource/image/LOGO_TECNM_BLANCO.png"
          alt="Logo"
          width={64}
          height={64}
          className="h-16 w-auto mr-2 object-contain"
          
        />

        <Image
          src="/resource/image/TECNM_1.png"
          alt="Logo"
          width={64}
          height={64}
          className="h-16 w-auto mr-2 object-contain"
        />
      </header>

      {/* Contenido principal */}
      <main className="flex-grow flex flex-col items-center justify-center relative z-10">
        <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-300">
          <h1 className="text-3xl font-bold text-center mb-4 text-blue-700">
            ¡Bienvenido!
            <p className="text-sm font-normal text-gray-700">
              Introduzca sus datos para iniciar sesión.
            </p>
          </h1>

          {error && (
            <div className="bg-red-500 text-white p-2 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Usuario
              </label>
              <div className="flex items-center bg-gray-200 rounded-lg">
                <div className="px-3 text-gray-500">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  name="correo"
                  placeholder="ejemplo@dominio.com"
                  className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-6 relative">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Contraseña
              </label>
              <div className="flex items-center bg-gray-200 rounded-lg">
                <div className="px-3 text-gray-500">
                  <FaLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="contraseña"
                  placeholder="********"
                  className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700"
                  style={{ height: "49%", top: "47%" }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-2 px-4 rounded-lg w-full shadow-lg transform hover:scale-105 transition-transform"
              >
                Iniciar sesión
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link href="/register" passHref>
              <p className="text-sm text-blue-500 hover:underline">
                Registrarse
              </p>
            </Link>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="bg-white bg-opacity-75 py-4 text-center">
        <p className="text-3xl font-bold text-blue-700">Convenios</p>
        <div>
          <p className="text-lg font-sans text-gray-900">
            Contratos y convenios son acuerdos de voluntades suscritos entre dos
            o más partes, siendo estas personas jurídicas o naturales, a través
            de los cuales se obligan recíproca o conjuntamente sobre materias o
            cosas determinadas, a cuyo cumplimiento pueden ser compelidas.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Loginpage;

import NextAuth from "next-auth";
import { authOptions } from "@/libs/authOptions"; // Ruta correcta al archivo donde está authOptions

const handler = NextAuth(authOptions);

// Exporta los métodos HTTP para que Next.js pueda manejarlos correctamente
export { handler as GET, handler as POST };

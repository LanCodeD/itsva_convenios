import NextAuth, { DefaultSession } from "next-auth";

// Extiende la interfaz DefaultSession para incluir `id` y `role`
declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: string; // Añadimos el campo `role` a la sesión
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    role: string; // Añadimos el campo `role` al usuario
  }
}

// Extiende la interfaz JWT para incluir `role`
declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: string; // Añadimos el campo `role` al token JWT
  }
}


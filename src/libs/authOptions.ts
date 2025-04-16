import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/libs/database";
import { CustomUser } from "@/types/authTypes";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        correo: { label: "Correo", type: "text", placeholder: "Correo" },
        contraseña: { label: "Contraseña", type: "password", placeholder: "*****" },
      },
      async authorize(credentials) {
        const connection = await connectDB();

        try {
          const [userFound]: any = await connection.execute<any[]>(
            'SELECT * FROM usuario WHERE correo = ?',
            [credentials?.correo]
          );

          if (!userFound || userFound.length === 0) {
            throw new Error("Credenciales Inválidas");
          }

          const user = userFound[0];

          const passwordMatch = await bcrypt.compare(
            credentials!.contraseña,
            user.contraseña
          );

          if (!passwordMatch) {
            throw new Error("Credenciales Inválidas");
          }

          return {
            id: user.id_usuario,
            name: `${user.nombre} ${user.apellido}`,
            email: user.correo,
            role: user.rol,
          };
        } finally {
          connection.release();
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
        token.role = user.role;
      }
      console.log("Este es el usuario logueado: ", token.user);
      console.log("Este es el rol del usuario logueado: ", token.role);
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as CustomUser;
      session.user.role = token.role;
      return session;
    },
    async redirect({ url, baseUrl }) {
      const isUnsafe =
        !url.startsWith(baseUrl) ||
        url.includes("localhost") ||
        url.includes(":3000") ||
        url.includes(":3002");
    
      //console.log("🔁 Redireccionando...");
      //console.log("   url:", url);
      //console.log("   baseUrl:", baseUrl);
      //console.log("   ¿Es inseguro?", isUnsafe);
    
      if (isUnsafe) {
        return baseUrl + "/login";
      }
    
      return url;
    },
    
  },
};

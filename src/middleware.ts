// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuthenticated = !!req.nextauth.token;
    const currentPath = req.nextUrl.pathname;

    if (!isAuthenticated && currentPath !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/", "/dashboard", "/admin"],
};



/* "/dashboard/:path*" -- en caso de querer protejer todo lo que tenga esa ruta de carpeta */
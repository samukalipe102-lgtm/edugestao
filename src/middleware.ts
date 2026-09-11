import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { canAccess, homeForRole } from "@/lib/roles";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const role = (token?.role as string) || "";

    if (!canAccess(role, pathname)) {
      // Redireciona para a home do próprio perfil
      return NextResponse.redirect(new URL(homeForRole(role), req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/professor/:path*",
    "/aluno/:path*",
    "/responsavel/:path*",
    "/documentos/:path*",
    "/relatorios/:path*",
  ],
};

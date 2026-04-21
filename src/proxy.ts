import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Daftar public routing
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute = pathname === "/";

  // Jika kita berada di route auth atau root dan sudah login => alihkan ke dashboard (berdasarkan role)
  if ((isAuthRoute || isPublicRoute) && isLoggedIn) {
    const role = req.auth?.user?.role;
    if (role === "ADMIN") {
      return Response.redirect(new URL("/admin", req.nextUrl));
    } else if (role === "GURU") {
      return Response.redirect(new URL("/guru", req.nextUrl));
    } else {
      return Response.redirect(new URL("/siswa", req.nextUrl));
    }
  }

  // Jika kita bukan di public route dan belum login => alihkan ke /login
  // Misal kita lindungi semua route kecuali "/" dan authRoutes
  
  if (!isLoggedIn && !isAuthRoute && !isPublicRoute) {
    // Abaikan jika ini route path statik seperti gambar dan next assets
    if (!pathname.startsWith("/_next") && !pathname.startsWith("/api") && !pathname.includes('.')) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }
  }

  return;
});

// Configure matcher where the middleware triggers
export const config = {
  matcher: [
    // Ignore api routes, _next/static, _next/image, favicon.ico
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};

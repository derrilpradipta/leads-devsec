import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Ambil token dari cookie
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Jika mencoba masuk dashboard tapi tidak punya token
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Catatan: redirect /login -> /dashboard TIDAK dilakukan di sini.
  // Cookie hanya penanda, bukan bukti sesi aktif — cookie sisa bisa membuat user
  // terlempar ke dashboard padahal localStorage (sesi asli) sudah kosong.
  // Keputusan "sudah login" dilakukan di app/login/page.tsx lewat localStorage,
  // dan app/dashboard/layout.tsx membuang sesi yang tidak valid.

  return NextResponse.next();
}

// Hanya proteksi dashboard dan halaman login
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
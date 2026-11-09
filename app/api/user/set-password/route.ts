import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";

// ⚠️ [LAB-VULN-CSRF] SENGAJA RENTAN — hanya untuk tugas kuliah DevSecOps.
// Endpoint ganti password ini:
//   1. mengandalkan cookie auth_token sebagai identitas (cookie otomatis dikirim browser),
//   2. TIDAK punya CSRF token,
//   3. TIDAK memeriksa header Origin/Referer,
//   4. menerima GET (state-changing GET) sehingga lolos SameSite=Lax.
// Akibatnya halaman milik domain/situs lain bisa mengganti password korban selama korban
// sudah login. Versi aman: method POST + CSRF token + cek Origin + verifikasi password lama.
async function gantiPassword(newPassword: string) {
  const cookieStore = await cookies();
  const username = cookieStore.get("auth_token")?.value;

  if (!username) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }
  if (!newPassword) {
    return NextResponse.json({ message: "Parameter newPassword wajib diisi" }, { status: 400 });
  }

  await prisma.user.update({
    where: { username },
    data: { password: newPassword },
  });

  return NextResponse.json({
    message: "Password berhasil diganti",
    username,
    passwordBaru: newPassword,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return gantiPassword(searchParams.get("newPassword") || "");
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let newPassword = "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    newPassword = String(form.get("newPassword") || "");
  } else {
    const body = await request.json().catch(() => ({}));
    newPassword = String((body as any).newPassword || "");
  }

  return gantiPassword(newPassword);
}

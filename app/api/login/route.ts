import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  try {
    // ⚠️ [LAB-VULN-SQLI] SENGAJA RENTAN — hanya untuk tugas kuliah.
    // Input user disambung langsung ke SQL (string concatenation, tanpa parameterisasi).
    // Versi aman ada di git: prisma.user.findUnique({ where: { username } })
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, nama, username, role FROM "User" WHERE username = '${username}' AND password = '${password}' LIMIT 1`
    );
    const user = rows[0];

    if (user) {
      // 1. Response JSON untuk kebutuhan frontend (localStorage)
      const response = NextResponse.json({ 
        message: "Login Berhasil",
        user: {
          id: user.id,
          username: user.username,
          nama: user.nama || user.username,
          role: user.role
        }
      }, { status: 200 });

      // 2. Simpan Cookie untuk Middleware (Sesuai spek Next.js 15)
      const cookieStore = await cookies(); 
      cookieStore.set("auth_token", String(user.username), {
        httpOnly: true, // Aman dari XSS
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // Berlaku 7 hari
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json({ message: "Username atau password salah" }, { status: 401 });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
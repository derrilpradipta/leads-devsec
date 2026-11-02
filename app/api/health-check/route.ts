import { NextResponse } from "next/server";
import { exec } from "child_process";

// ⚠️ [LAB-VULN-CMDI] SENGAJA RENTAN — hanya untuk tugas kuliah DevSecOps.
// Endpoint "health check" ini menjalankan ping lewat shell dan menyambung input
// user langsung ke command line. Payload `127.0.0.1 & whoami` akan ikut dieksekusi.
// Versi aman: pakai execFile("ping", ["-n", "1", host]) TANPA shell, + validasi host.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const host = searchParams.get("host") || "8.8.8.8";

  const command = `ping -n 1 ${host}`;

  return new Promise<NextResponse>((resolve) => {
    exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
      resolve(
        NextResponse.json({
          command,
          exitCode: error ? (error.code ?? 1) : 0,
          output: stdout || stderr || "",
        })
      );
    });
  });
}

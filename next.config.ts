import type { NextConfig } from 'next'

// Jangan taruh kredensial di sini: key di `env` ikut di-inline ke bundle JS
// yang dikirim ke browser. Kredensial hanya di .env (lokal) atau Environment
// Variables Vercel (production).
const nextConfig: NextConfig = {}

export default nextConfig
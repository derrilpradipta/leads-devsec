// app/dashboard/layout.tsx
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem('user_id');
    const role = localStorage.getItem('user_role');

    // Cookie di middleware hanya penanda. Sesi asli ada di localStorage:
    // kalau tidak ada, buang cookie sisa lalu kembalikan ke halaman login.
    if (!uid || !role) {
      fetch('/api/logout', { method: 'POST' })
        .catch(() => {})
        .finally(() => router.replace('/login'));
      return;
    }
    setSiap(true);
  }, [router]);

  if (!siap) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Memeriksa sesi...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />

      {/* Ganti ml-72 menjadi lg:pl-72 (padding kiri hanya di layar besar).
        Tambahkan pt-20 agar konten tidak tertutup tombol Hamburger di mobile.
      */}
      <main className="flex-1 w-full pt-20 lg:pt-0 lg:pl-72 transition-all duration-300">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
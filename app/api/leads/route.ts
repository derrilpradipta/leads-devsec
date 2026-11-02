import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// POST — simpan data baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, webMasuk, orderWaOts, orderWeb, userId, products } = body;

    if (!userId) {
      return NextResponse.json({ message: "User ID tidak valid" }, { status: 400 });
    }

    const newLead = await prisma.lead.create({
      data: {
        tanggal: new Date(tanggal),
        webMasuk: Number(webMasuk),
        orderWaOts: Number(orderWaOts),
        orderWeb: Number(orderWeb),
        closingRate: (Number(orderWaOts) + Number(orderWeb)) / (Number(webMasuk) || 1),
        products: products ?? [],  // ← tambah ini
        user: {
          connect: { id: Number(userId) }
        }
      },
    });

    return NextResponse.json({ message: "Data berhasil disimpan", data: newLead }, { status: 201 });
  } catch (error) {
    console.error("Error POST Leads:", error);
    return NextResponse.json({ message: "Gagal menyimpan ke database" }, { status: 500 });
  }
}

// GET — ambil data dengan filter role
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let dateFilter: any = {};

    if (from && to) {
      dateFilter = { tanggal: { gte: new Date(from), lte: new Date(to + "T23:59:59") } };
    } else if (month && year) {
      const firstDay = new Date(Number(year), Number(month), 1);
      const lastDay = new Date(Number(year), Number(month) + 1, 0, 23, 59, 59);
      dateFilter = { tanggal: { gte: firstDay, lte: lastDay } };
    }

    let whereClause: any = { ...dateFilter };
    if (role !== "ADMIN") {
      if (!userId || userId === "null") return NextResponse.json([]);
      whereClause.userId = Number(userId);
    }

    // ⚠️ [LAB-VULN-SQLI] SENGAJA RENTAN — hanya untuk tugas kuliah.
    // Parameter `search` disambung langsung ke SQL, jadi bisa dipakai untuk
    // menembus filter kepemilikan data (OR 1=1) atau mencuri data tabel lain (UNION).
    const search = searchParams.get("search");
    if (search) {
      const sql = `SELECT * FROM "Lead" WHERE "userId" = ${Number(userId) || 0} AND "products"::text ILIKE '%${search}%' ORDER BY "tanggal" DESC`;
      const rows = await prisma.$queryRawUnsafe(sql);
      return NextResponse.json(rows);
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: { tanggal: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error GET Leads:", error);
    return NextResponse.json({ message: "Gagal ambil data" }, { status: 500 });
  }
}
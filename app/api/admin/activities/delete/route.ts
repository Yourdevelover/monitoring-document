import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }
  const formData = await request.formData();
  const date = String(formData.get("date") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Tanggal tidak valid. Format YYYY-MM-DD." }, { status: 400 });
  }
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  // Use UTC day; logs stored in UTC. For Jakarta, adjust if needed.
  const result = await prisma.activityLog.deleteMany({
    where: { createdAt: { gte: start, lt: end } },
  });
  await prisma.activityLog.create({
    data: {
      actorId: admin.id,
      action: "DELETE_ACTIVITY_LOG",
      targetType: "ACTIVITY_LOG",
      description: `Hapus ${result.count} log tanggal ${date} oleh ${admin.email}`,
    },
  });
  return NextResponse.redirect(new URL(`/dashboard/admin/activities?deleted=${result.count}&date=${date}`, request.url));
}

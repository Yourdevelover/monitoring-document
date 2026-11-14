import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 13;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const leader = await getSessionUser();
  if (!leader || leader.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const { id } = await params;
  const employeeId = Number(id);
  if (!Number.isInteger(employeeId) || employeeId < 1) {
    return NextResponse.json({ error: "Karyawan tidak ditemukan." }, { status: 404 });
  }

  const employee = await prisma.user.findFirst({
    where: { id: employeeId, role: "KARYAWAN" },
    select: { id: true },
  });

  if (!employee) {
    return NextResponse.json({ error: "Karyawan tidak ditemukan." }, { status: 404 });
  }

  const where = {
    actorId: employee.id,
    action: { in: ["LOGOUT", "UPLOAD_FILE", "SUBMIT_FILE"] },
  };
  const totalItems = await prisma.activityLog.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const requestedPage = Math.max(1, Number(new URL(request.url).searchParams.get("page")) || 1);
  const page = Math.min(requestedPage, totalPages);
  const activities = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: { id: true, description: true, createdAt: true },
  });

  return NextResponse.json({
    activities: activities.map((activity) => ({
      ...activity,
      createdAt: activity.createdAt.toISOString(),
    })),
    page,
    totalPages,
    totalItems,
  });
}
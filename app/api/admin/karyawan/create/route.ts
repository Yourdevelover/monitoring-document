import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/redirect";

export async function POST(request: Request) {
  const admin = await getSessionUser();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const leaderId = Number(formData.get("leaderId") ?? "0");

  if (!name || !email || !/^\d{6}$/.test(password) || !Number.isInteger(leaderId) || leaderId <= 0) {
    return NextResponse.json(
      { error: "Nama, email, password 6 angka, dan Leader wajib dipilih." },
      { status: 400 }
    );
  }

  const [existingUser, leader] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findFirst({
      where: { id: leaderId, role: "LEADER", isActive: "ACTIVE" },
      include: { department: true, ledTeam: { include: { department: true } } },
    }),
  ]);

  if (existingUser) {
    return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
  }

  const departmentId = leader?.ledTeam?.departmentId ?? leader?.departmentId;
  const department = leader?.ledTeam?.department ?? leader?.department;
  if (!leader || !departmentId || !department?.isActive || leader.ledTeam?.isActive === false) {
    return NextResponse.json({ error: "Leader tidak memiliki departemen aktif atau timnya nonaktif." }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const team = leader.ledTeam ?? await tx.team.create({
      data: {
        name: `Tim ${leader.name}`,
        leaderId: leader.id,
        departmentId,
        isActive: true,
      },
    });
    const createdEmployee = await tx.user.create({
      data: {
        name,
        email,
        phoneNumber: phoneNumber || null,
        passwordHash: await hash(password, 10),
        role: "KARYAWAN",
        isActive: "ACTIVE",
        teamId: team.id,
        departmentId: team.departmentId,
      },
    });
    await tx.activityLog.create({
      data: {
        actorId: admin.id,
        action: "CREATE_EMPLOYEE",
        targetType: "USER",
        targetId: createdEmployee.id,
        description: `Admin ${admin.email} menambahkan karyawan ${createdEmployee.email} ke tim ${team.name} dengan leader ${leader.name}.`,
      },
    });
  });

  return NextResponse.redirect(new URL("/dashboard/admin/karyawan", getBaseUrl(request)));
}

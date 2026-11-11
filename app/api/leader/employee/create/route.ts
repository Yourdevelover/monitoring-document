import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireLeader } from "@/lib/auth";
import { getBaseUrl } from "@/lib/redirect";

export async function POST(request: Request) {
  try {
    const leader = await requireLeader();

    const formData = await request.formData();
    const bulkEmployees = String(formData.get("employees") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const position = String(formData.get("position") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (bulkEmployees) {
      const rows = bulkEmployees
        .split(/\r?\n/)
        .map((row) => row.trim())
        .filter(Boolean);
      const employeeParts = rows.map((row) => {
        const delimiter = row.includes(",") ? "," : "|";
        return row.split(delimiter).map((value) => value.trim());
      });
      const invalidRow = employeeParts.findIndex(
        (parts) => parts.length !== 4 || parts.some((part) => !part)
      );
      if (invalidRow >= 0) {
        return NextResponse.json(
          { success: false, error: `Baris ${invalidRow + 1} harus memakai format: nama,email,jabatan,password.` },
          { status: 400 }
        );
      }

      const employees = employeeParts.map(([employeeName, employeeEmail, employeePosition, employeePassword]) => ({
        name: employeeName,
        email: employeeEmail.toLowerCase(),
        position: employeePosition,
        password: employeePassword,
      }));

      if (employees.length > 100) {
        return NextResponse.json(
          { success: false, error: "Maksimal 100 karyawan dapat ditambahkan sekaligus." },
          { status: 400 }
        );
      }

      const emails = employees.map((employee) => employee.email);
      if (new Set(emails).size !== emails.length || employees.some((employee) => !/^\d{6}$/.test(employee.password))) {
        return NextResponse.json(
          { success: false, error: "Email tidak boleh duplikat dan password harus tepat 6 angka." },
          { status: 400 }
        );
      }

      const leaderDepartment = leader.departmentId
        ? await prisma.department.findFirst({ where: { id: leader.departmentId, isActive: true } })
        : null;
      if (!leaderDepartment) return NextResponse.json({ error: "Departemen Leader belum ditentukan atau sudah nonaktif." }, { status: 400 });
      const team = await prisma.team.upsert({
        where: { leaderId: leader.id },
        update: {},
        create: { name: `Tim ${leader.name}`, leaderId: leader.id, departmentId: leaderDepartment.id, isActive: true },
      });

      const existingUsers = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true },
      });
      if (existingUsers.length > 0) {
        return NextResponse.json(
          { success: false, error: `Email sudah terdaftar: ${existingUsers.map((user) => user.email).join(", ")}.` },
          { status: 409 }
        );
      }

      const preparedEmployees = await Promise.all(
        employees.map(async (employee) => ({
          ...employee,
          passwordHash: await hash(employee.password, 10),
        }))
      );

      await prisma.$transaction(async (tx) => {
        for (const employee of preparedEmployees) {
          const createdEmployee = await tx.user.create({
            data: {
              name: employee.name,
              email: employee.email,
              passwordHash: employee.passwordHash,
              role: "KARYAWAN",
              teamId: team.id,
              departmentId: team.departmentId,
              position: employee.position,
              isActive: "ACTIVE",
            },
          });
          await tx.activityLog.create({
            data: {
              actorId: leader.id,
              action: "CREATE_EMPLOYEE",
              targetType: "USER",
              targetId: createdEmployee.id,
              description: `Leader ${leader.email} menambahkan karyawan ${createdEmployee.email} ke tim ${team.name}.`,
            },
          });
        }
      });

      return NextResponse.redirect(new URL("/dashboard/leader/karyawan", getBaseUrl(request)));
    }

    if (!name || !email || !position || !/^\d{6}$/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama, email, jabatan, dan password 6 angka wajib diisi.",
        },
        { status: 400 }
      );
    }

    const leaderDepartment = leader.departmentId
      ? await prisma.department.findFirst({ where: { id: leader.departmentId, isActive: true } })
      : null;
    if (!leaderDepartment) return NextResponse.json({ error: "Departemen Leader belum ditentukan atau sudah nonaktif." }, { status: 400 });
    const team = await prisma.team.upsert({
      where: { leaderId: leader.id },
      update: {},
      create: { name: `Tim ${leader.name}`, leaderId: leader.id, departmentId: leaderDepartment.id, isActive: true },
    });

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Email sudah terdaftar.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 10);

    const employee = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "KARYAWAN",
        teamId: team.id,
        departmentId: team.departmentId,
        position,
        isActive: "ACTIVE",
      },
    });

    await prisma.activityLog.create({
      data: {
        actorId: leader.id,
        action: "CREATE_EMPLOYEE",
        targetType: "USER",
        targetId: employee.id,
        description: `Leader ${leader.email} menambahkan karyawan ${employee.email} ke tim ${team.name}.`,
      },
    });

    return NextResponse.redirect(new URL("/dashboard/leader/karyawan", getBaseUrl(request)));
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server saat menyimpan karyawan.",
      },
      { status: 500 }
    );
  }
}

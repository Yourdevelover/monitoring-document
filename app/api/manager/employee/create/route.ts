import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const manager = await requireManager();

    const formData = await request.formData();
    const bulkEmployees = String(formData.get("employees") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
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
        (parts) => parts.length !== 3 || parts.some((part) => !part)
      );
      if (invalidRow >= 0) {
        return NextResponse.json(
          { success: false, error: `Baris ${invalidRow + 1} harus memakai format: nama,email,password.` },
          { status: 400 }
        );
      }

      const employees = employeeParts.map(([employeeName, employeeEmail, employeePassword]) => ({
        name: employeeName,
        email: employeeEmail.toLowerCase(),
        password: employeePassword,
      }));

      if (employees.length > 100) {
        return NextResponse.json(
          { success: false, error: "Maksimal 100 karyawan dapat ditambahkan sekaligus." },
          { status: 400 }
        );
      }

      const emails = employees.map((employee) => employee.email);
      if (new Set(emails).size !== emails.length || employees.some((employee) => employee.password.length < 6)) {
        return NextResponse.json(
          { success: false, error: "Email dalam daftar tidak boleh duplikat dan password minimal 6 karakter." },
          { status: 400 }
        );
      }

      const team = await prisma.team.upsert({
        where: { managerId: manager.id },
        update: {},
        create: { name: `Tim ${manager.name}`, managerId: manager.id, isActive: true },
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
              isActive: "ACTIVE",
            },
          });
          await tx.activityLog.create({
            data: {
              actorId: manager.id,
              action: "CREATE_EMPLOYEE",
              targetType: "USER",
              targetId: createdEmployee.id,
              description: `Manager ${manager.email} menambahkan karyawan ${createdEmployee.email} ke tim ${team.name}.`,
            },
          });
        }
      });

      return NextResponse.redirect(new URL("/dashboard/manajer/karyawan", request.url));
    }

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama, email, dan password wajib diisi dengan password minimal 6 karakter.",
        },
        { status: 400 }
      );
    }

    const team = await prisma.team.upsert({
      where: { managerId: manager.id },
      update: {},
      create: { name: `Tim ${manager.name}`, managerId: manager.id, isActive: true },
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
        isActive: "ACTIVE",
      },
    });

    await prisma.activityLog.create({
      data: {
        actorId: manager.id,
        action: "CREATE_EMPLOYEE",
        targetType: "USER",
        targetId: employee.id,
        description: `Manager ${manager.email} menambahkan karyawan ${employee.email} ke tim ${team.name}.`,
      },
    });

    return NextResponse.redirect(new URL("/dashboard/manajer/karyawan", request.url));
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

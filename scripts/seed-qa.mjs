import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "qa@monitoring.local";
  const password = "qa";
  const hash = await bcrypt.hash(password, 10);
  const department = await prisma.department.findFirst({
    where: { name: "Collection/Penagihan", isActive: true },
  });
  if (!department) throw new Error("Active Collection/Penagihan department is required for the QA leader.");

  const leader = await prisma.user.upsert({
    where: { email },
    create: {
      name: "QA User",
      email,
      role: "LEADER",
      isActive: "ACTIVE",
      departmentId: department.id,
      passwordHash: hash,
    },
    update: { passwordHash: hash, departmentId: department.id, role: "LEADER", isActive: "ACTIVE" },
  });
  await prisma.team.upsert({
    where: { leaderId: leader.id },
    create: {
      name: `Tim ${leader.name}`,
      leaderId: leader.id,
      departmentId: department.id,
      isActive: true,
    },
    update: { departmentId: department.id, isActive: true },
  });
  console.log("QA user upserted");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

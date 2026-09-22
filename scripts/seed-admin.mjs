import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@monitoring.local";
  const password = process.env.ADMIN_PASSWORD ?? "admin";

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  const passwordHash = await bcrypt.hash(password, 10);

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: existingUser.name || "Admin IT",
        role: "ADMIN",
        isActive: "ACTIVE",
        passwordHash,
      },
    });

    console.log(`Admin account updated: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      name: "Admin IT",
      email,
      passwordHash,
      role: "ADMIN",
      isActive: "ACTIVE",
    },
  });

  console.log(`Admin account created: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

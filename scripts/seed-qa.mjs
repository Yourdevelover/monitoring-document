import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "qa@monitoring.local";
  const password = "qa";
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    create: {
      name: "QA User",
      email,
      role: "MANAGER",
      isActive: "ACTIVE",
      passwordHash: hash,
    },
    update: { passwordHash: hash },
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

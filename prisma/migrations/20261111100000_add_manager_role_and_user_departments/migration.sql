ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MANAJER';

ALTER TABLE "users"
ADD COLUMN "departmentId" INTEGER,
ADD COLUMN "position" TEXT;

UPDATE "users" AS users
SET "departmentId" = teams."departmentId"
FROM "teams" AS teams
WHERE users."teamId" = teams."id"
  AND users."departmentId" IS NULL;

CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");

ALTER TABLE "users"
ADD CONSTRAINT "users_departmentId_fkey"
FOREIGN KEY ("departmentId") REFERENCES "departments"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
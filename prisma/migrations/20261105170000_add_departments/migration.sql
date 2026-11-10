CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

INSERT INTO "departments" ("name", "updatedAt")
VALUES
  ('Collection/Penagihan', CURRENT_TIMESTAMP),
  ('Backoffice/Pendukung', CURRENT_TIMESTAMP);

ALTER TABLE "teams" ADD COLUMN "departmentId" INTEGER;

UPDATE "teams"
SET "departmentId" = (SELECT "id" FROM "departments" WHERE "name" = 'Collection/Penagihan');

ALTER TABLE "teams" ALTER COLUMN "departmentId" SET NOT NULL;
CREATE INDEX "teams_departmentId_idx" ON "teams"("departmentId");

ALTER TABLE "teams" ADD CONSTRAINT "teams_departmentId_fkey"
FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "positions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");
CREATE UNIQUE INDEX "positions_name_key" ON "positions"("name");

ALTER TABLE "teams" ADD COLUMN "departmentId" INTEGER;
ALTER TABLE "users" ADD COLUMN "positionId" INTEGER;

CREATE INDEX "teams_departmentId_idx" ON "teams"("departmentId");
CREATE INDEX "users_positionId_idx" ON "users"("positionId");

ALTER TABLE "teams" ADD CONSTRAINT "teams_departmentId_fkey"
FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "users" ADD CONSTRAINT "users_positionId_fkey"
FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
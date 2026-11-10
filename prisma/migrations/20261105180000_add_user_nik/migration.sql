ALTER TABLE "users" ADD COLUMN "nik" TEXT;

CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");
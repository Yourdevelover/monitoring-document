ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_positionId_fkey";
ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "teams_departmentId_fkey";

DROP INDEX IF EXISTS "users_positionId_idx";
DROP INDEX IF EXISTS "teams_departmentId_idx";

ALTER TABLE "users" DROP COLUMN IF EXISTS "positionId";
ALTER TABLE "teams" DROP COLUMN IF EXISTS "departmentId";

DROP TABLE IF EXISTS "positions";
DROP TABLE IF EXISTS "departments";
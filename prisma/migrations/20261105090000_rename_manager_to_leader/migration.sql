ALTER TYPE "Role" RENAME VALUE 'MANAGER' TO 'LEADER';

ALTER TABLE "teams" RENAME COLUMN "managerId" TO "leaderId";
ALTER TABLE "announcements" RENAME COLUMN "managerId" TO "leaderId";

ALTER INDEX "teams_managerId_key" RENAME TO "teams_leaderId_key";
ALTER TABLE "teams" RENAME CONSTRAINT "teams_managerId_fkey" TO "teams_leaderId_fkey";
ALTER TABLE "announcements" RENAME CONSTRAINT "announcements_managerId_fkey" TO "announcements_leaderId_fkey";

UPDATE "activity_logs"
SET "action" = replace("action", 'MANAGER', 'LEADER')
WHERE "action" LIKE '%MANAGER%';

UPDATE "activity_logs"
SET "description" = replace(replace(replace(replace("description", 'Manajer', 'Leader'), 'manajer', 'leader'), 'Manager', 'Leader'), 'manager', 'leader')
WHERE "description" ~* '(manajer|manager)';
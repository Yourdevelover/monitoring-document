DROP INDEX "targets_period_isPublic_idx";

ALTER TABLE "users" DROP COLUMN "profilePicture";
ALTER TABLE "uploads" DROP COLUMN "fileType";
ALTER TABLE "targets" DROP COLUMN "isPublic";
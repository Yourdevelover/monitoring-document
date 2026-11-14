ALTER TABLE "users" DROP COLUMN "lastLoginAt";

ALTER TABLE "activity_logs"
  DROP COLUMN "ipAddress",
  DROP COLUMN "userAgent";

DROP TYPE "ApprovalStatus";
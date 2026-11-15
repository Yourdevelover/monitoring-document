UPDATE "uploads"
SET "isImportant" = TRUE
WHERE "importantSaved" = TRUE;

ALTER TABLE "uploads"
  ALTER COLUMN "submissionDate" DROP DEFAULT,
  ALTER COLUMN "submissionDate" DROP NOT NULL;

UPDATE "uploads"
SET "submissionDate" = NULL
WHERE "isSubmitted" = FALSE;

DROP INDEX "uploads_userId_importantSavedAt_idx";

ALTER TABLE "uploads"
  DROP COLUMN "title",
  DROP COLUMN "fileName",
  DROP COLUMN "isSubmitted",
  DROP COLUMN "importantSaved",
  DROP COLUMN "importantCopyPath",
  DROP COLUMN "importantSavedAt",
  DROP COLUMN "expiresAt",
  DROP COLUMN "createdAt",
  DROP COLUMN "updatedAt";
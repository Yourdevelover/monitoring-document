ALTER TABLE "uploads"
ADD COLUMN "importantCopyPath" TEXT,
ADD COLUMN "importantSavedAt" TIMESTAMP(3);

DO $$
BEGIN
  IF to_regclass('"important_files"') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "important_files" AS important
    LEFT JOIN "uploads" AS upload ON upload.id = important."sourceUploadId"
    WHERE upload.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot merge important_files: a saved file has no matching upload.';
  END IF;

  UPDATE "uploads" AS upload
  SET
    "importantSaved" = TRUE,
    "importantCopyPath" = important."filePath",
    "importantSavedAt" = important."savedAt"
  FROM "important_files" AS important
  WHERE upload.id = important."sourceUploadId";

  DROP TABLE "important_files";
END $$;

CREATE INDEX "uploads_userId_importantSavedAt_idx"
ON "uploads"("userId", "importantSavedAt");
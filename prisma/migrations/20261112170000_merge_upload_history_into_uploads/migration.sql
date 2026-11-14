DO $$
BEGIN
  IF to_regclass('"upload_history"') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "upload_history" AS history
    LEFT JOIN "uploads" AS upload ON upload.id = history."sourceUploadId"
    WHERE upload.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot merge upload_history: a history row has no matching upload.';
  END IF;

  UPDATE "uploads" AS upload
  SET
    "userId" = history."userId",
    "teamId" = history."teamId",
    title = history.title,
    "fileName" = history."fileName",
    "filePath" = history."filePath",
    "fileType" = history."fileType",
    category = history.category,
    status = history.status,
    note = history.note,
    "submissionDate" = history."submittedAt",
    "isSubmitted" = TRUE
  FROM "upload_history" AS history
  WHERE upload.id = history."sourceUploadId";

  DROP TABLE "upload_history";
END $$;

CREATE INDEX "uploads_teamId_category_submissionDate_idx"
ON "uploads"("teamId", "category", "submissionDate");

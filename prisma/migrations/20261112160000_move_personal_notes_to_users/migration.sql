ALTER TABLE "users"
ADD COLUMN "personalNotes" JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE "users" AS users
SET "personalNotes" = notes.items
FROM (
  SELECT
    "userId",
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'content', content,
        'createdAt', "createdAt",
        'updatedAt', "updatedAt"
      )
      ORDER BY "updatedAt" DESC, id DESC
    ) AS items
  FROM "personal_notes"
  GROUP BY "userId"
) AS notes
WHERE users.id = notes."userId";

DROP TABLE "personal_notes";
ALTER TABLE "users"
ADD COLUMN "profileRequests" JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE "users" AS "user"
SET "profileRequests" = requests."items"
FROM (
  SELECT
    "userId",
    jsonb_agg(
      jsonb_build_object(
        'id', "id"::text,
        'userId', "userId",
        'fieldName', "fieldName",
        'oldValue', "oldValue",
        'newValue', "newValue",
        'status', "status"::text,
        'reviewerId', "reviewerId",
        'reviewNote', "reviewNote",
        'createdAt', "createdAt",
        'updatedAt', "updatedAt"
      )
      ORDER BY "createdAt" DESC, "id" DESC
    ) AS "items"
  FROM "profile_requests"
  GROUP BY "userId"
) AS requests
WHERE "user"."id" = requests."userId";

DROP TABLE "profile_requests";
UPDATE "users" AS "leader"
SET "isActive" = 'REJECTED'
WHERE "leader"."role" = 'LEADER'
  AND "leader"."isActive" = 'INACTIVE'
  AND EXISTS (
    SELECT 1
    FROM "teams" AS "team"
    WHERE "team"."leaderId" = "leader"."id"
      AND "team"."isActive" = false
      AND NOT EXISTS (
        SELECT 1
        FROM "users" AS "member"
        WHERE "member"."teamId" = "team"."id"
      )
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "activity_logs" AS "activity"
    WHERE "activity"."actorId" = "leader"."id"
      AND "activity"."action" = 'LOGIN'
  );
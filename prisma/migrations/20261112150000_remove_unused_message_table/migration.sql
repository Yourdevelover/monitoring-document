DO $$
BEGIN
  IF to_regclass('"messages"') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM "messages" LIMIT 1) THEN
    RAISE EXCEPTION 'Cannot drop messages table: existing rows must be reviewed or backed up first.';
  END IF;

  DROP TABLE "messages";
END $$;
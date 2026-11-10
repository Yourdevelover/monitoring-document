ALTER TABLE "targets"
ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "targets_period_isPublic_idx" ON "targets"("period", "isPublic");
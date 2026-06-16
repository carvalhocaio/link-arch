ALTER TABLE "urls" DROP CONSTRAINT IF EXISTS "urls_key_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "urls_key_active_unique" ON "urls" ("key") WHERE "is_deleted" = false;

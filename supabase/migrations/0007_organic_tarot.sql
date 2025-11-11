ALTER TABLE "profiles" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profile_name_length_check" CHECK ("profiles"."name" IS NULL OR char_length("profiles"."name") between 2 and 100);
ALTER TABLE "move_translations" DROP CONSTRAINT "move_trans_slug_length_check";--> statement-breakpoint
DROP INDEX "idx_move_trans_slug_language";--> statement-breakpoint
ALTER TABLE "move_translations" DROP COLUMN "slug";
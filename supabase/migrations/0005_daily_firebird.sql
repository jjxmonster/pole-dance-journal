ALTER TABLE "move_translations" DROP CONSTRAINT "move_trans_name_length_check";--> statement-breakpoint
DROP INDEX "idx_move_trans_name_active";--> statement-breakpoint
ALTER TABLE "move_translations" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "move_translations" DROP COLUMN "level";
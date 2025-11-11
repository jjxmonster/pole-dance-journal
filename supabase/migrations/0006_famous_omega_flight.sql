ALTER TABLE "moves" DROP CONSTRAINT "description_length_check";--> statement-breakpoint
ALTER TABLE "steps" DROP CONSTRAINT "title_length_check";--> statement-breakpoint
ALTER TABLE "steps" DROP CONSTRAINT "description_length_check";--> statement-breakpoint
ALTER TABLE "moves" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "steps" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "steps" DROP COLUMN "description";
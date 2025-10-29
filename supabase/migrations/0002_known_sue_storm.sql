ALTER TABLE "moves" DROP CONSTRAINT "description_length_check";--> statement-breakpoint
ALTER TABLE "steps" DROP CONSTRAINT "title_length_check";--> statement-breakpoint
ALTER TABLE "steps" DROP CONSTRAINT "description_length_check";--> statement-breakpoint
ALTER TABLE "moves" ADD CONSTRAINT "description_length_check" CHECK (char_length("moves"."description") between 10 and 1000);--> statement-breakpoint
ALTER TABLE "steps" ADD CONSTRAINT "title_length_check" CHECK (char_length("steps"."title") between 3 and 350);--> statement-breakpoint
ALTER TABLE "steps" ADD CONSTRAINT "description_length_check" CHECK (char_length("steps"."description") between 10 and 350);
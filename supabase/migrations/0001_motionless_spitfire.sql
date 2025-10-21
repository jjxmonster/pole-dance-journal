CREATE TABLE "move_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"move_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_length_check" CHECK (char_length("move_notes"."content") <= 2000)
);
--> statement-breakpoint
ALTER TABLE "move_notes" ADD CONSTRAINT "move_notes_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_notes" ADD CONSTRAINT "move_notes_user_move_fk" FOREIGN KEY ("user_id","move_id") REFERENCES "public"."user_move_statuses"("user_id","move_id") ON DELETE no action ON UPDATE no action;
CREATE TYPE "public"."language" AS ENUM('en', 'pl');--> statement-breakpoint
CREATE TABLE "move_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"move_id" uuid NOT NULL,
	"language" "language" NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"slug" text NOT NULL,
	"level" "move_level" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "move_language_unique" UNIQUE("move_id","language"),
	CONSTRAINT "move_trans_name_length_check" CHECK (char_length("move_translations"."name") between 3 and 100),
	CONSTRAINT "move_trans_description_length_check" CHECK (char_length("move_translations"."description") between 10 and 1000),
	CONSTRAINT "move_trans_slug_length_check" CHECK (char_length("move_translations"."slug") between 3 and 100)
);
--> statement-breakpoint
CREATE TABLE "step_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"step_id" uuid NOT NULL,
	"language" "language" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "step_language_unique" UNIQUE("step_id","language"),
	CONSTRAINT "step_trans_title_length_check" CHECK (char_length("step_translations"."title") between 3 and 350),
	CONSTRAINT "step_trans_description_length_check" CHECK (char_length("step_translations"."description") between 10 and 350)
);
--> statement-breakpoint
ALTER TABLE "move_translations" ADD CONSTRAINT "move_translations_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_translations" ADD CONSTRAINT "step_translations_step_id_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_move_trans_slug_language" ON "move_translations" USING btree ("slug","language");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_move_trans_name_active" ON "move_translations" USING btree (lower("name"),"language");
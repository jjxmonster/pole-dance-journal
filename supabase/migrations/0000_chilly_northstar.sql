CREATE TYPE "public"."move_level" AS ENUM('Beginner', 'Intermediate', 'Advanced');--> statement-breakpoint
CREATE TYPE "public"."move_status" AS ENUM('WANT', 'ALMOST', 'DONE');--> statement-breakpoint
CREATE TABLE "moves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"level" "move_level" NOT NULL,
	"slug" text NOT NULL,
	"image_url" text,
	"published_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "name_length_check" CHECK (char_length("moves"."name") between 3 and 100),
	CONSTRAINT "description_length_check" CHECK (char_length("moves"."description") between 10 and 500)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"move_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "move_order_unique" UNIQUE("move_id","order_index"),
	CONSTRAINT "order_index_check" CHECK ("steps"."order_index" > 0),
	CONSTRAINT "title_length_check" CHECK (char_length("steps"."title") between 3 and 150),
	CONSTRAINT "description_length_check" CHECK (char_length("steps"."description") between 10 and 150)
);
--> statement-breakpoint
CREATE TABLE "user_move_statuses" (
	"user_id" uuid NOT NULL,
	"move_id" uuid NOT NULL,
	"status" "move_status" DEFAULT 'WANT' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_move_statuses_user_id_move_id_pk" PRIMARY KEY("user_id","move_id"),
	CONSTRAINT "note_length_check" CHECK (char_length("user_move_statuses"."note") <= 2000)
);
--> statement-breakpoint
ALTER TABLE "steps" ADD CONSTRAINT "steps_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_move_statuses" ADD CONSTRAINT "user_move_statuses_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_moves_name_active" ON "moves" USING btree (lower("name")) WHERE "moves"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_moves_slug_unique" ON "moves" USING btree (lower("slug"));
CREATE TABLE "combo_moves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"combo_id" uuid NOT NULL,
	"move_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "combo_move_order_unique" UNIQUE("combo_id","order_index"),
	CONSTRAINT "combo_order_index_check" CHECK ("combo_moves"."order_index" between 1 and 8)
);
--> statement-breakpoint
CREATE TABLE "combos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"level" "move_level" NOT NULL,
	"slug" text NOT NULL,
	"published_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "combo_name_length_check" CHECK (char_length("combos"."name") between 3 and 100)
);
--> statement-breakpoint
CREATE TABLE "user_combo_favorites" (
	"user_id" uuid NOT NULL,
	"combo_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_combo_favorites_user_id_combo_id_pk" PRIMARY KEY("user_id","combo_id")
);
--> statement-breakpoint
ALTER TABLE "combo_moves" ADD CONSTRAINT "combo_moves_combo_id_combos_id_fk" FOREIGN KEY ("combo_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_moves" ADD CONSTRAINT "combo_moves_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_combo_favorites" ADD CONSTRAINT "user_combo_favorites_combo_id_combos_id_fk" FOREIGN KEY ("combo_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_combos_slug_unique" ON "combos" USING btree (lower("slug"));
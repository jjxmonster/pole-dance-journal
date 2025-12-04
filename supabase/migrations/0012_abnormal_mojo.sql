CREATE TABLE "combo_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"combo_id" uuid NOT NULL,
	"language" "language" NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "combo_language_unique" UNIQUE("combo_id","language"),
	CONSTRAINT "combo_trans_description_length_check" CHECK (char_length("combo_translations"."description") between 10 and 1000)
);
--> statement-breakpoint
ALTER TABLE "combo_translations" ADD CONSTRAINT "combo_translations_combo_id_combos_id_fk" FOREIGN KEY ("combo_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;
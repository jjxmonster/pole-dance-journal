CREATE TABLE "move_combo_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"move_id" uuid NOT NULL,
	"referenced_move_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "combo_move_order_unique" UNIQUE("move_id","order_index"),
	CONSTRAINT "combo_no_duplicate_reference" UNIQUE("move_id","referenced_move_id"),
	CONSTRAINT "combo_order_index_check" CHECK ("move_combo_references"."order_index" between 1 and 3),
	CONSTRAINT "combo_no_self_reference" CHECK ("move_combo_references"."move_id" != "move_combo_references"."referenced_move_id")
);
--> statement-breakpoint
ALTER TABLE "move_combo_references" ADD CONSTRAINT "move_combo_references_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_combo_references" ADD CONSTRAINT "move_combo_references_referenced_move_id_moves_id_fk" FOREIGN KEY ("referenced_move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;
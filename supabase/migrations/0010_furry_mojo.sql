ALTER TABLE "move_combo_references" RENAME TO "move_transition_references";--> statement-breakpoint
ALTER TABLE "move_transition_references" DROP CONSTRAINT "combo_move_order_unique";--> statement-breakpoint
ALTER TABLE "move_transition_references" DROP CONSTRAINT "combo_no_duplicate_reference";--> statement-breakpoint
ALTER TABLE "move_transition_references" DROP CONSTRAINT "combo_order_index_check";--> statement-breakpoint
ALTER TABLE "move_transition_references" DROP CONSTRAINT "combo_no_self_reference";--> statement-breakpoint
ALTER TABLE "move_transition_references" DROP CONSTRAINT "move_combo_references_move_id_moves_id_fk";
--> statement-breakpoint
ALTER TABLE "move_transition_references" DROP CONSTRAINT "move_combo_references_referenced_move_id_moves_id_fk";
--> statement-breakpoint
ALTER TABLE "move_transition_references" ADD CONSTRAINT "move_transition_references_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_transition_references" ADD CONSTRAINT "move_transition_references_referenced_move_id_moves_id_fk" FOREIGN KEY ("referenced_move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_transition_references" ADD CONSTRAINT "transition_move_order_unique" UNIQUE("move_id","order_index");--> statement-breakpoint
ALTER TABLE "move_transition_references" ADD CONSTRAINT "transition_no_duplicate_reference" UNIQUE("move_id","referenced_move_id");--> statement-breakpoint
ALTER TABLE "move_transition_references" ADD CONSTRAINT "transition_order_index_check" CHECK ("move_transition_references"."order_index" between 1 and 3);--> statement-breakpoint
ALTER TABLE "move_transition_references" ADD CONSTRAINT "transition_no_self_reference" CHECK ("move_transition_references"."move_id" != "move_transition_references"."referenced_move_id");
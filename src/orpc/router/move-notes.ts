import { ORPCError, os } from "@orpc/server";
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import {
	addMoveNote,
	deleteMoveNote,
	getMoveNotes,
} from "../../data-access/move-notes";
import { checkMoveExists } from "../../data-access/user-move-statuses";
import { authMiddleware } from "../auth";
import {
	MoveNoteAddInputSchema,
	MoveNoteAddOutputSchema,
	MoveNoteDeleteInputSchema,
	MoveNoteDeleteOutputSchema,
	MoveNotesGetInputSchema,
	MoveNotesGetOutputSchema,
} from "../schema";

export const getNotes = os
	.input(MoveNotesGetInputSchema)
	.output(MoveNotesGetOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const data = await supabase.auth.getUser();

		if (!data.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "You must be signed in to get notes.",
			});
		}

		const userId = data.data.user.id;

		const moveExists = await checkMoveExists(input.moveId);
		if (!moveExists) {
			throw new ORPCError("NOT_FOUND", {
				message: `Move with ID ${input.moveId} not found`,
			});
		}

		try {
			const notes = await getMoveNotes(userId, input.moveId);
			return notes;
		} catch {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to get move notes",
			});
		}
	});

export const addNote = os
	.input(MoveNoteAddInputSchema)
	.output(MoveNoteAddOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const data = await supabase.auth.getUser();

		if (!data.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "You must be signed in to add notes.",
			});
		}

		const userId = data.data.user.id;

		const moveExists = await checkMoveExists(input.moveId);
		if (!moveExists) {
			throw new ORPCError("NOT_FOUND", {
				message: `Move with ID ${input.moveId} not found`,
			});
		}

		try {
			const note = await addMoveNote(userId, input.moveId, input.content);
			return note;
		} catch {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to add move note",
			});
		}
	});

export const deleteNote = os
	.input(MoveNoteDeleteInputSchema)
	.output(MoveNoteDeleteOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const data = await supabase.auth.getUser();

		if (!data.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "You must be signed in to delete notes.",
			});
		}

		const userId = data.data.user.id;

		try {
			const success = await deleteMoveNote(userId, input.noteId);

			if (!success) {
				throw new ORPCError("NOT_FOUND", {
					message: "Note not found or you don't have permission to delete it",
				});
			}

			return { success };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to delete move note",
			});
		}
	});

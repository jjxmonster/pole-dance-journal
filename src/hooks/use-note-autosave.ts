import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { client } from "@/orpc/client";
import type { MoveStatus, SaveStatus } from "@/types/move";
import { useAuth } from "./use-auth";
import { useDebouncedValue } from "./use-debounced-value";

const AUTO_HIDE_DURATION_MS = 2000;
const DEFAULT_DEBOUNCE_MS = 2000;

type UseNoteAutosaveOptions = {
	moveId: string;
	initialNote: string | null;
	status?: MoveStatus;
};

export function useNoteAutosave({
	moveId,
	initialNote,
	status = "WANT",
}: UseNoteAutosaveOptions) {
	const { isAuthenticated } = useAuth();
	const [note, setNote] = useState(initialNote || "");
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	const [isDirty, setIsDirty] = useState(false);

	const debouncedNote = useDebouncedValue(note, DEFAULT_DEBOUNCE_MS);

	const { mutate: saveNote, isPending } = useMutation({
		mutationFn: async (noteContent: string) => {
			const result = await client.userMoveStatuses.set({
				moveId,
				status,
				note: noteContent,
			});
			return result;
		},
		onMutate: () => {
			setSaveStatus("saving");
		},
		onSuccess: () => {
			setSaveStatus("saved");
			setIsDirty(false);
			setTimeout(() => setSaveStatus("idle"), AUTO_HIDE_DURATION_MS);
		},
		onError: () => {
			setSaveStatus("error");
			// Error is displayed in the UI via the SaveIndicator component
		},
	});

	// Save note when debounced value changes
	useEffect(() => {
		if (isAuthenticated && isDirty && debouncedNote.trim() !== "") {
			saveNote(debouncedNote);
		}
	}, [debouncedNote, isDirty, isAuthenticated, saveNote]);

	const handleNoteChange = useCallback((newNote: string) => {
		setNote(newNote);
		setIsDirty(true);
		setSaveStatus("idle");
	}, []);

	return {
		note,
		setNote: handleNoteChange,
		saveStatus,
		isSaving: isPending,
		isDirty,
		characterCount: note.length,
	};
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { client } from "@/orpc/client";
import { NOTE_MAX_LENGTH } from "@/utils/constants";

export function useNotes(moveId: string) {
	const [content, setContent] = useState("");
	const queryClient = useQueryClient();

	const { data: notes = [], isLoading } = useQuery({
		queryKey: ["moveNotes", moveId],
		queryFn: async () => {
			const result = await client.moveNotes.getNotes({ moveId });
			return result;
		},
	});

	const { mutate: addNote, isPending: isAddingNote } = useMutation({
		mutationFn: async (noteContent: string) => {
			const result = await client.moveNotes.addNote({
				moveId,
				content: noteContent,
			});
			return result;
		},
		onSuccess: () => {
			setContent("");
			toast.success("Notatka dodana");
			queryClient.invalidateQueries({ queryKey: ["moveNotes", moveId] });
		},
	});

	const { mutate: deleteNote, isPending: isDeletingNote } = useMutation({
		mutationFn: async (noteId: string) => {
			const result = await client.moveNotes.deleteNote({
				noteId,
			});
			return result;
		},
		onSuccess: () => {
			toast.success("Notatka usunięta");
			queryClient.invalidateQueries({ queryKey: ["moveNotes", moveId] });
		},
	});

	const handleContentChange = (newContent: string) => {
		if (newContent.length <= NOTE_MAX_LENGTH) {
			setContent(newContent);
		}
	};

	const handleSave = () => {
		if (content.trim()) {
			addNote(content);
		}
	};

	const handleDelete = (noteId: string) => {
		deleteNote(noteId);
	};

	return {
		notes,
		content,
		setContent: handleContentChange,
		addNote: handleSave,
		deleteNote: handleDelete,
		isLoading,
		isAddingNote,
		isDeletingNote,
		characterCount: content.length,
	};
}

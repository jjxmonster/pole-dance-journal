import { useState } from "react";
import { useNoteAutosave } from "@/hooks/use-note-autosave";
import type { SaveStatus } from "@/types/move";
import { NOTE_MAX_LENGTH, NOTE_WARNING_THRESHOLD } from "@/utils/constants";
import { Textarea } from "../ui/textarea";

type NoteEditorProps = {
	moveId: string;
	initialNote: string | null;
};

type CharacterCounterProps = {
	count: number;
	max: number;
};

type SaveIndicatorProps = {
	status: SaveStatus;
};

function CharacterCounter({ count, max }: CharacterCounterProps) {
	const isApproachingLimit = count >= NOTE_WARNING_THRESHOLD;
	const isAtLimit = count >= max;

	let textColorClass = "text-muted-foreground";
	if (isAtLimit) {
		textColorClass = "text-destructive";
	} else if (isApproachingLimit) {
		textColorClass = "text-warning";
	}

	return (
		<span aria-live="polite" className={`text-xs ${textColorClass}`}>
			{count}/{max}
		</span>
	);
}

function SaveIndicator({ status }: SaveIndicatorProps) {
	const statusMessages = {
		idle: "",
		saving: "Zapisywanie...",
		saved: "Zapisano",
		error: "Błąd zapisu",
	};

	const statusStyles = {
		idle: "",
		saving: "text-muted-foreground",
		saved: "text-green-600",
		error: "text-destructive",
	};

	if (status === "idle") {
		return null;
	}

	return (
		<span aria-live="polite" className={`text-xs ${statusStyles[status]}`}>
			{statusMessages[status]}
		</span>
	);
}

export function NoteEditor({ moveId, initialNote }: NoteEditorProps) {
	// Constants for animation durations
	const TRANSITION_DURATION_MS = 200;

	const [expanded, setExpanded] = useState(!!initialNote);

	const { note, setNote, saveStatus, characterCount } = useNoteAutosave({
		moveId,
		initialNote,
	});

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		if (newValue.length <= NOTE_MAX_LENGTH) {
			setNote(newValue);
		}
	};

	const handleFocus = () => {
		setExpanded(true);
	};

	const handleBlur = () => {
		if (note.trim() === "") {
			setExpanded(false);
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-lg">Twoje notatki</h3>
				<div className="flex items-center gap-2">
					<SaveIndicator status={saveStatus} />
					<CharacterCounter count={characterCount} max={NOTE_MAX_LENGTH} />
				</div>
			</div>

			<Textarea
				aria-label="Prywatne notatki do figury"
				className={`duration-${TRANSITION_DURATION_MS} transition-all ${expanded ? "min-h-[150px]" : "h-[60px]"}`}
				maxLength={NOTE_MAX_LENGTH}
				onBlur={handleBlur}
				onChange={handleChange}
				onFocus={handleFocus}
				placeholder="Dodaj swoje prywatne notatki..."
				value={note}
			/>

			<div aria-live="polite" className="text-muted-foreground text-xs">
				Notatki są prywatne i widoczne tylko dla Ciebie.
			</div>
		</div>
	);
}

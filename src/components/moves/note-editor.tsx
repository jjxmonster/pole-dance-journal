import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { useNotes } from "@/hooks/use-move-notes";
import type { MoveNote } from "@/types/move";
import { NOTE_MAX_LENGTH, NOTE_WARNING_THRESHOLD } from "@/utils/constants";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";

type NoteEditorProps = {
	moveId: string;
};

type CharacterCounterProps = {
	count: number;
	max: number;
};

type NoteItemProps = {
	note: MoveNote;
	onDelete: (id: string) => void;
	isDeleting: boolean;
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

function NoteItem({ note, onDelete, isDeleting }: NoteItemProps) {
	const formattedDate = new Intl.DateTimeFormat("pl-PL", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(note.createdAt));

	return (
		<Card className="space-y-2 p-4">
			<div className="whitespace-pre-wrap">{note.content}</div>
			<div className="flex items-center justify-between">
				<span className="text-muted-foreground text-xs">{formattedDate}</span>
				<Button
					aria-label="Delete note"
					disabled={isDeleting}
					onClick={() => onDelete(note.id)}
					size="sm"
					variant="destructive"
				>
					<TrashIcon className="h-3 w-3" />
				</Button>
			</div>
		</Card>
	);
}

export function NoteEditor({ moveId }: NoteEditorProps) {
	const {
		notes,
		content,
		setContent,
		addNote,
		deleteNote,
		isLoading,
		isAddingNote,
		isDeletingNote,
		characterCount,
	} = useNotes(moveId);

	const [expanded, setExpanded] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setContent(e.target.value);
	};

	const handleFocus = () => {
		setExpanded(true);
	};

	const handleBlur = () => {
		if (content.trim() === "") {
			setExpanded(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		addNote();
	};

	return (
		<div className="mt-6 space-y-6">
			<div>
				<h3 className="mb-4 font-medium text-lg">Moje Notatki</h3>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<Textarea
							aria-label="Add a new note"
							className={`transition-all duration-200 ${expanded ? "min-h-[150px]" : "h-[60px]"}`}
							maxLength={NOTE_MAX_LENGTH}
							onBlur={handleBlur}
							onChange={handleChange}
							onFocus={handleFocus}
							placeholder="Dodaj nową notatkę..."
							value={content}
						/>
						<div className="mt-2 flex items-center justify-between">
							<div className="text-muted-foreground text-xs">
								Notatki są prywatne i widoczne tylko dla Ciebie.
							</div>
							<CharacterCounter count={characterCount} max={NOTE_MAX_LENGTH} />
						</div>
					</div>

					<div className="flex justify-end">
						<Button
							disabled={content.trim() === "" || isAddingNote}
							type="submit"
						>
							{isAddingNote ? "Dodawanie..." : "Dodaj Notatkę"}
						</Button>
					</div>
				</form>
			</div>

			{notes.length > 0 && (
				<div className="space-y-4">
					<h4 className="font-medium">Historia notatek</h4>
					{isLoading ? (
						<div className="text-muted-foreground">Ładowanie notatek...</div>
					) : (
						<div className="space-y-4">
							{notes.map((note) => (
								<NoteItem
									isDeleting={isDeletingNote}
									key={note.id}
									note={note}
									onDelete={deleteNote}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/orpc/client";
import { m } from "@/paraglide/messages";

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 25;
const SUCCESS_MESSAGE_TIMEOUT = 3000;

type NameEditorProps = {
	currentName: string;
	onUpdate: () => void;
};

export function NameEditor({ currentName, onUpdate }: NameEditorProps) {
	const [name, setName] = useState(currentName);
	const [showSuccess, setShowSuccess] = useState(false);
	const [showError, setShowError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const mutation = useMutation({
		mutationFn: (updatedName: string) =>
			orpc.profiles.updateName.call({ name: updatedName }),
		onSuccess: () => {
			setShowSuccess(true);
			setShowError(false);
			onUpdate();
			setTimeout(() => {
				setShowSuccess(false);
			}, SUCCESS_MESSAGE_TIMEOUT);
		},
		onError: (error: Error) => {
			setShowError(true);
			setShowSuccess(false);
			setErrorMessage(error.message || "Failed to update name");
		},
	});

	const isValid =
		name.trim().length >= NAME_MIN_LENGTH &&
		name.trim().length <= NAME_MAX_LENGTH;
	const hasChanged = name.trim() !== currentName.trim();
	const canSave = isValid && hasChanged && !mutation.isPending;

	const handleSave = () => {
		if (!canSave) {
			return;
		}
		mutation.mutate(name.trim());
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">{m.settings_name_label()}</Label>
				<Input
					disabled={mutation.isPending}
					id="name"
					maxLength={NAME_MAX_LENGTH}
					minLength={NAME_MIN_LENGTH}
					onChange={(e) => setName(e.target.value)}
					placeholder={m.settings_name_placeholder()}
					type="text"
					value={name}
				/>
				<p className="text-muted-foreground text-sm">
					{m.settings_name_character_counter({
						current: name.trim().length.toString(),
						max: NAME_MAX_LENGTH.toString(),
					})}
				</p>
			</div>

			{showSuccess && (
				<Alert>
					<CheckCircle2 className="size-4" />
					<AlertDescription>{m.settings_name_success()}</AlertDescription>
				</Alert>
			)}

			{showError && (
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}

			<Button disabled={!canSave} onClick={handleSave} type="button">
				{mutation.isPending
					? m.settings_name_saving()
					: m.settings_name_save_button()}
			</Button>
		</div>
	);
}

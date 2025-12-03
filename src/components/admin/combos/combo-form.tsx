import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/orpc/client";
import type { AdminCreateComboInput } from "@/orpc/schema";
import {
	COMBO_DESCRIPTION_MAX_LENGTH,
	COMBO_DESCRIPTION_MIN_LENGTH,
	COMBO_MOVES_MIN_COUNT,
	COMBO_NAME_MAX_LENGTH,
	COMBO_NAME_MIN_LENGTH,
} from "@/utils/constants";
import { ComboMovesSelector } from "./combo-moves-selector";

type ComboFormState = {
	name: string;
	descriptionEn: string;
	descriptionPl: string;
	level: "Beginner" | "Intermediate" | "Advanced" | "";
	moveIds: string[];
};

const initialFormState: ComboFormState = {
	name: "",
	descriptionEn: "",
	descriptionPl: "",
	level: "",
	moveIds: [],
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: will be fix when migrate to tanstack form
export function ComboForm() {
	const navigate = useNavigate();
	const [formState, setFormState] = useState<ComboFormState>(initialFormState);
	const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
	const [hasFormChanged, setHasFormChanged] = useState(false);
	const [comboId, setComboId] = useState<string | null>(null);
	const [validationErrors, setValidationErrors] = useState<{
		name?: string;
		descriptionEn?: string;
		descriptionPl?: string;
		level?: string;
		moveIds?: string;
	}>({});

	const createComboMutation = useMutation({
		mutationFn: (data: AdminCreateComboInput) =>
			orpc.admin.combos.createCombo.call(data),
		onSuccess: (data) => {
			setComboId(data.id);
			toast.success("Combo draft created successfully!");
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to create combo";
			toast.error(errorMessage);
		},
	});

	const publishComboMutation = useMutation({
		mutationFn: (id: string) => orpc.admin.combos.publishCombo.call({ id }),
		onSuccess: () => {
			toast.success("Combo published successfully!");
			navigate({ to: "/admin/combos" });
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to publish combo";
			toast.error(errorMessage);
		},
	});

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: will be fix when migrate to tanstack form
	const validateForm = (): boolean => {
		const errors: typeof validationErrors = {};

		if (!formState.name.trim()) {
			errors.name = "Name is required";
		} else if (formState.name.length < COMBO_NAME_MIN_LENGTH) {
			errors.name = `Name must be at least ${COMBO_NAME_MIN_LENGTH} characters`;
		}

		if (!formState.descriptionEn.trim()) {
			errors.descriptionEn = "English description is required";
		} else if (formState.descriptionEn.length < COMBO_DESCRIPTION_MIN_LENGTH) {
			errors.descriptionEn = `English description must be at least ${COMBO_DESCRIPTION_MIN_LENGTH} characters`;
		}

		if (!formState.descriptionPl.trim()) {
			errors.descriptionPl = "Polish description is required";
		} else if (formState.descriptionPl.length < COMBO_DESCRIPTION_MIN_LENGTH) {
			errors.descriptionPl = `Polish description must be at least ${COMBO_DESCRIPTION_MIN_LENGTH} characters`;
		}

		if (!formState.level) {
			errors.level = "Level is required";
		}

		if (formState.moveIds.length < COMBO_MOVES_MIN_COUNT) {
			errors.moveIds = `At least ${COMBO_MOVES_MIN_COUNT} moves are required`;
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!validateForm()) {
			return;
		}

		await createComboMutation.mutateAsync({
			name: formState.name,
			descriptionEn: formState.descriptionEn,
			descriptionPl: formState.descriptionPl,
			level: formState.level as "Beginner" | "Intermediate" | "Advanced",
			moveIds: formState.moveIds,
		});
	};

	const handlePublish = async () => {
		if (!comboId) {
			return;
		}
		await publishComboMutation.mutateAsync(comboId);
	};

	const handleInputChange = (field: keyof ComboFormState, value: string) => {
		setHasFormChanged(true);
		setFormState((prev) => ({ ...prev, [field]: value }));
		if (validationErrors[field as keyof typeof validationErrors]) {
			setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const handleMoveIdsChange = (moveIds: string[]) => {
		setHasFormChanged(true);
		setFormState((prev) => ({ ...prev, moveIds }));
		if (validationErrors.moveIds) {
			setValidationErrors((prev) => ({ ...prev, moveIds: undefined }));
		}
	};

	const handleCancel = () => {
		if (hasFormChanged || comboId) {
			setShowUnsavedWarning(true);
		} else {
			navigate({ to: "/admin/combos" });
		}
	};

	const isFormDisabled =
		createComboMutation.isPending ||
		publishComboMutation.isPending ||
		!!comboId;
	const nameLength = formState.name.length;
	const descriptionEnLength = formState.descriptionEn.length;
	const descriptionPlLength = formState.descriptionPl.length;

	return (
		<>
			<form className="space-y-6" onSubmit={handleFormSubmit}>
				<fieldset className="space-y-6" disabled={isFormDisabled}>
					<div>
						<Label className="mb-2 block font-medium text-sm" htmlFor="name">
							Combo Name <span className="text-destructive">*</span>
						</Label>
						<Input
							aria-describedby={
								validationErrors.name ? "name-error" : undefined
							}
							id="name"
							maxLength={COMBO_NAME_MAX_LENGTH}
							onChange={(e) => handleInputChange("name", e.target.value)}
							placeholder="e.g., Beginner Flow Combo"
							value={formState.name}
						/>
						<div className="mt-1 flex items-center justify-between">
							{validationErrors.name && (
								<div className="text-destructive text-sm" id="name-error">
									{validationErrors.name}
								</div>
							)}
							<span className="ml-auto text-muted-foreground text-xs">
								{nameLength}/{COMBO_NAME_MAX_LENGTH}
							</span>
						</div>
					</div>

					<div>
						<Label className="mb-2 block font-medium text-sm" htmlFor="level">
							Difficulty Level <span className="text-destructive">*</span>
						</Label>
						<Select
							onValueChange={(value) => handleInputChange("level", value)}
							value={formState.level}
						>
							<SelectTrigger
								aria-describedby={
									validationErrors.level ? "level-error" : undefined
								}
								id="level"
							>
								<SelectValue placeholder="Select a level" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Beginner">Beginner</SelectItem>
								<SelectItem value="Intermediate">Intermediate</SelectItem>
								<SelectItem value="Advanced">Advanced</SelectItem>
							</SelectContent>
						</Select>
						{validationErrors.level && (
							<div className="mt-1 text-destructive text-sm" id="level-error">
								{validationErrors.level}
							</div>
						)}
					</div>

					<div>
						<Label
							className="mb-2 block font-medium text-sm"
							htmlFor="descriptionEn"
						>
							English Description <span className="text-destructive">*</span>
						</Label>
						<Textarea
							aria-describedby={
								validationErrors.descriptionEn
									? "descriptionEn-error"
									: undefined
							}
							id="descriptionEn"
							maxLength={COMBO_DESCRIPTION_MAX_LENGTH}
							onChange={(e) =>
								handleInputChange("descriptionEn", e.target.value)
							}
							placeholder="Describe the combo in English..."
							rows={4}
							value={formState.descriptionEn}
						/>
						<div className="mt-1 flex items-center justify-between">
							{validationErrors.descriptionEn && (
								<div
									className="text-destructive text-sm"
									id="descriptionEn-error"
								>
									{validationErrors.descriptionEn}
								</div>
							)}
							<span className="ml-auto text-muted-foreground text-xs">
								{descriptionEnLength}/{COMBO_DESCRIPTION_MAX_LENGTH}
							</span>
						</div>
					</div>

					<div>
						<Label
							className="mb-2 block font-medium text-sm"
							htmlFor="descriptionPl"
						>
							Polish Description <span className="text-destructive">*</span>
						</Label>
						<Textarea
							aria-describedby={
								validationErrors.descriptionPl
									? "descriptionPl-error"
									: undefined
							}
							id="descriptionPl"
							maxLength={COMBO_DESCRIPTION_MAX_LENGTH}
							onChange={(e) =>
								handleInputChange("descriptionPl", e.target.value)
							}
							placeholder="Opisz combo po polsku..."
							rows={4}
							value={formState.descriptionPl}
						/>
						<div className="mt-1 flex items-center justify-between">
							{validationErrors.descriptionPl && (
								<div
									className="text-destructive text-sm"
									id="descriptionPl-error"
								>
									{validationErrors.descriptionPl}
								</div>
							)}
							<span className="ml-auto text-muted-foreground text-xs">
								{descriptionPlLength}/{COMBO_DESCRIPTION_MAX_LENGTH}
							</span>
						</div>
					</div>

					<ComboMovesSelector
						disabled={isFormDisabled}
						error={validationErrors.moveIds}
						onChange={handleMoveIdsChange}
						value={formState.moveIds}
					/>

					{createComboMutation.isError && (
						<Alert variant="destructive">
							<AlertDescription>
								{createComboMutation.error instanceof Error
									? createComboMutation.error.message
									: "An unexpected error occurred"}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex gap-3">
						<Button
							className="flex-1"
							disabled={createComboMutation.isPending}
							type="submit"
						>
							{createComboMutation.isPending ? "Creating..." : "Save Draft"}
						</Button>
						<Button
							disabled={createComboMutation.isPending}
							onClick={handleCancel}
							type="button"
							variant="outline"
						>
							Cancel
						</Button>
					</div>
				</fieldset>

				{comboId && (
					<div className="border-border border-t pt-6">
						<div className="rounded-lg border border-green-200 bg-green-50 p-4">
							<h3 className="mb-2 font-semibold text-green-800">
								Combo Draft Created!
							</h3>
							<p className="mb-4 text-green-700 text-sm">
								Your combo has been saved as a draft. You can now publish it to
								make it visible to users.
							</p>

							<div className="flex gap-3">
								<Button
									className="flex-1"
									disabled={publishComboMutation.isPending}
									onClick={handlePublish}
									type="button"
								>
									{publishComboMutation.isPending
										? "Publishing..."
										: "Publish Combo"}
								</Button>
								<Button
									disabled={publishComboMutation.isPending}
									onClick={() => navigate({ to: "/admin/combos" })}
									type="button"
									variant="outline"
								>
									Save as Draft
								</Button>
							</div>
						</div>

						{publishComboMutation.isError && (
							<Alert className="mt-4" variant="destructive">
								<AlertDescription>
									{publishComboMutation.error instanceof Error
										? publishComboMutation.error.message
										: "Failed to publish combo"}
								</AlertDescription>
							</Alert>
						)}
					</div>
				)}
			</form>

			{showUnsavedWarning && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="rounded-lg border border-border bg-card p-6 shadow-lg">
						<h2 className="mb-2 font-semibold text-lg">Discard Changes?</h2>
						<p className="mb-6 text-muted-foreground text-sm">
							You have unsaved changes. Do you want to leave without saving?
						</p>
						<div className="flex gap-3">
							<Button
								onClick={() => setShowUnsavedWarning(false)}
								variant="outline"
							>
								Keep Editing
							</Button>
							<Button
								onClick={() => {
									setShowUnsavedWarning(false);
									navigate({ to: "/admin/combos" });
								}}
								variant="destructive"
							>
								Discard Changes
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

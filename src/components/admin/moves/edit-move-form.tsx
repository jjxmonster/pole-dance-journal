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
import { useEditMoveForm } from "@/hooks/use-edit-move-form";
import { orpc } from "@/orpc/client";
import type { AdminEditMoveInput, AdminGetMoveOutput } from "@/orpc/schema";
import {
	MOVE_DESCRIPTION_MAX_LENGTH,
	MOVE_DESCRIPTION_WARNING_THRESHOLD,
	MOVE_NAME_MAX_LENGTH,
	MOVE_NAME_WARNING_THRESHOLD,
} from "@/utils/constants";
import { ImageGenerator } from "./image-generator";
import { StepEditor } from "./step-editor";

type EditMoveFormProps = {
	move: AdminGetMoveOutput;
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: move form is complex
export function EditMoveForm({ move: moveData }: EditMoveFormProps) {
	const navigate = useNavigate();
	const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
	const [hasFormChanged, setHasFormChanged] = useState(false);
	const [imageAccepted, setImageAccepted] = useState(false);

	const {
		formState,
		errors,
		isSubmitting,
		handleInputChange,
		handleStepChange,
		addStep,
		removeStep,
		handleSubmit,
		getStepErrors,
	} = useEditMoveForm(moveData.move);

	const editMoveMutation = useMutation({
		mutationFn: (data: AdminEditMoveInput) =>
			orpc.admin.moves.editMove.call(data),
		onSuccess: () => {
			toast.success("Move draft updated successfully!");
			setHasFormChanged(false);
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update move";
			toast.error(errorMessage);
		},
	});

	const publishMoveMutation = useMutation({
		mutationFn: () =>
			orpc.admin.moves.publishMove.call({ id: moveData.move.id }),
		onSuccess: () => {
			toast.success("Move published successfully!");
			navigate({ to: "/admin/moves" });
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to publish move";
			toast.error(errorMessage);
		},
	});

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		await handleSubmit(async (data) => {
			await editMoveMutation.mutateAsync(data);
		});
	};

	const handlePublish = async () => {
		await publishMoveMutation.mutateAsync();
	};

	const handleInputChangeWithTracking = (
		field: "name" | "description" | "level",
		value: string
	) => {
		setHasFormChanged(true);
		handleInputChange(field, value);
	};

	const handleStepChangeWithTracking = (
		index: number,
		field: "title" | "description",
		value: string
	) => {
		setHasFormChanged(true);
		handleStepChange(index, field, value);
	};

	const handleAddStepWithTracking = () => {
		setHasFormChanged(true);
		addStep();
	};

	const handleRemoveStepWithTracking = (index: number) => {
		setHasFormChanged(true);
		removeStep(index);
	};

	const handleCancel = () => {
		if (hasFormChanged) {
			setShowUnsavedWarning(true);
		} else {
			navigate({ to: "/admin/moves" });
		}
	};

	const handleImageAccepted = () => {
		setImageAccepted(true);
		toast.success("Image finalized!");
	};

	const nameLength = formState.name.length;
	const descriptionLength = formState.description.length;

	const nameError = errors?.issues.find(
		(issue) => Array.isArray(issue.path) && issue.path[0] === "name"
	)?.message;

	const descriptionError = errors?.issues.find(
		(issue) => Array.isArray(issue.path) && issue.path[0] === "description"
	)?.message;

	const levelError = errors?.issues.find(
		(issue) => Array.isArray(issue.path) && issue.path[0] === "level"
	)?.message;

	const stepsError = errors?.issues.find(
		(issue) => Array.isArray(issue.path) && issue.path[0] === "steps"
	)?.message;

	const isFormDisabled = isSubmitting || editMoveMutation.isPending;
	const isLoadingName = nameLength > MOVE_NAME_WARNING_THRESHOLD;
	const isLoadingDescription =
		descriptionLength > MOVE_DESCRIPTION_WARNING_THRESHOLD;

	return (
		<>
			<form className="space-y-6" onSubmit={handleFormSubmit}>
				<fieldset className="space-y-6" disabled={isFormDisabled}>
					<div>
						<Label className="mb-2 block font-medium text-sm" htmlFor="name">
							Move Name
						</Label>
						<Input
							aria-describedby={nameError ? "name-error" : undefined}
							id="name"
							maxLength={100}
							onChange={(e) =>
								handleInputChangeWithTracking("name", e.target.value)
							}
							placeholder="e.g., Butterfly"
							value={formState.name}
						/>
						<div className="mt-1 flex items-center justify-between">
							{nameError && (
								<div className="text-destructive text-sm" id="name-error">
									{nameError}
								</div>
							)}
							<span
								className={
									isLoadingName
										? "text-amber-600 text-xs"
										: "text-muted-foreground text-xs"
								}
							>
								{nameLength}/{MOVE_NAME_MAX_LENGTH}
							</span>
						</div>
					</div>

					<div>
						<Label
							className="mb-2 block font-medium text-sm"
							htmlFor="description"
						>
							Description
						</Label>
						<Textarea
							aria-describedby={
								descriptionError ? "description-error" : undefined
							}
							id="description"
							maxLength={MOVE_DESCRIPTION_MAX_LENGTH}
							onChange={(e) =>
								handleInputChangeWithTracking("description", e.target.value)
							}
							placeholder="Describe the move and its key characteristics..."
							value={formState.description}
						/>
						<div className="mt-1 flex items-center justify-between">
							{descriptionError && (
								<div
									className="text-destructive text-sm"
									id="description-error"
								>
									{descriptionError}
								</div>
							)}
							<span
								className={
									isLoadingDescription
										? "text-amber-600 text-xs"
										: "text-muted-foreground text-xs"
								}
							>
								{descriptionLength}/{MOVE_DESCRIPTION_MAX_LENGTH}
							</span>
						</div>
					</div>

					<div>
						<Label className="mb-2 block font-medium text-sm" htmlFor="level">
							Difficulty Level
						</Label>
						<Select
							onValueChange={(value) =>
								handleInputChangeWithTracking("level", value)
							}
							value={formState.level}
						>
							<SelectTrigger
								aria-describedby={levelError ? "level-error" : undefined}
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
						{levelError && (
							<div className="mt-1 text-destructive text-sm" id="level-error">
								{levelError}
							</div>
						)}
					</div>

					<StepEditor
						errors={errors}
						getStepErrors={getStepErrors}
						onAddStep={handleAddStepWithTracking}
						onRemoveStep={handleRemoveStepWithTracking}
						onStepChange={handleStepChangeWithTracking}
						steps={formState.steps}
					/>

					{stepsError && (
						<Alert variant="destructive">
							<AlertDescription>{stepsError}</AlertDescription>
						</Alert>
					)}

					{editMoveMutation.isError && (
						<Alert variant="destructive">
							<AlertDescription>
								{editMoveMutation.error instanceof Error
									? editMoveMutation.error.message
									: "An unexpected error occurred"}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex gap-3">
						<Button
							className="flex-1"
							disabled={isSubmitting || editMoveMutation.isPending}
							type="submit"
						>
							{isSubmitting || editMoveMutation.isPending
								? "Updating..."
								: "Save Changes"}
						</Button>
						<Button
							disabled={isSubmitting || editMoveMutation.isPending}
							onClick={handleCancel}
							type="button"
							variant="outline"
						>
							Cancel
						</Button>
					</div>
				</fieldset>

				{!editMoveMutation.isPending && (
					<>
						<div className="border-border border-t pt-6">
							<ImageGenerator
								isDisabled={false}
								moveId={moveData.move.id}
								onImageAccepted={handleImageAccepted}
							/>
						</div>

						{imageAccepted && (
							<div className="flex gap-3">
								<Button
									className="flex-1"
									disabled={publishMoveMutation.isPending}
									onClick={handlePublish}
									type="button"
								>
									{publishMoveMutation.isPending
										? "Publishing..."
										: "Publish Move"}
								</Button>
								<Button
									disabled={publishMoveMutation.isPending}
									onClick={() => {
										setImageAccepted(false);
									}}
									type="button"
									variant="outline"
								>
									Go Back
								</Button>
							</div>
						)}

						{publishMoveMutation.isError && (
							<Alert variant="destructive">
								<AlertDescription>
									{publishMoveMutation.error instanceof Error
										? publishMoveMutation.error.message
										: "Failed to publish move"}
								</AlertDescription>
							</Alert>
						)}
					</>
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
									navigate({ to: "/admin/moves" });
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

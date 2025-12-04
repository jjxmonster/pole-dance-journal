import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type MoveFormValues, moveFormSchema } from "form/schema";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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
import type { AdminCreateMoveInput } from "@/orpc/schema";
import {
	MOVE_DESCRIPTION_MAX_LENGTH,
	MOVE_DESCRIPTION_WARNING_THRESHOLD,
	MOVE_NAME_MAX_LENGTH,
	MOVE_NAME_WARNING_THRESHOLD,
} from "@/utils/constants";
import { ImageGenerator } from "./image-generator";
import { StepEditor } from "./step-editor";

function createDefaultStep() {
	return {
		id: crypto.randomUUID(),
		titleEn: "",
		titlePl: "",
		descriptionEn: "",
		descriptionPl: "",
	};
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: form is complex
export function MoveForm() {
	const navigate = useNavigate();

	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<MoveFormValues>({
		resolver: zodResolver(moveFormSchema),
		defaultValues: {
			name: "",
			descriptionEn: "",
			descriptionPl: "",
			level: undefined,
			steps: [createDefaultStep(), createDefaultStep()],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "steps",
	});

	const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
	const [moveId, setMoveId] = useState<string | null>(null);
	const [imageAccepted, setImageAccepted] = useState(false);

	const createMoveMutation = useMutation({
		mutationFn: (data: AdminCreateMoveInput) =>
			orpc.admin.moves.createMove.call(data),
		onSuccess: (data) => {
			setMoveId(data.id);
			toast.success("Move draft created successfully!");
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to create move";
			toast.error(errorMessage);
		},
	});

	const publishMoveMutation = useMutation({
		mutationFn: (id: string) => orpc.admin.moves.publishMove.call({ id }),
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

	const onSubmit = async (data: MoveFormValues) => {
		const submitData: AdminCreateMoveInput = {
			name: data.name,
			descriptionEn: data.descriptionEn,
			descriptionPl: data.descriptionPl,
			level: data.level,
			steps: data.steps.map((step) => ({
				titleEn: step.titleEn,
				titlePl: step.titlePl,
				descriptionEn: step.descriptionEn,
				descriptionPl: step.descriptionPl,
			})),
		};
		await createMoveMutation.mutateAsync(submitData);
	};

	const handlePublish = async () => {
		if (!moveId) {
			return;
		}
		await publishMoveMutation.mutateAsync(moveId);
	};

	const handleCancel = () => {
		if (isDirty || moveId) {
			setShowUnsavedWarning(true);
		} else {
			navigate({ to: "/admin/moves" });
		}
	};

	const handleImageAccepted = () => {
		setImageAccepted(true);
		toast.success("Image finalized!");
	};

	const handleAddStep = () => {
		append(createDefaultStep());
	};

	const watchedName = watch("name");
	const watchedDescriptionEn = watch("descriptionEn");
	const watchedDescriptionPl = watch("descriptionPl");

	const nameLength = watchedName?.length ?? 0;
	const descriptionEnLength = watchedDescriptionEn?.length ?? 0;
	const descriptionPlLength = watchedDescriptionPl?.length ?? 0;

	const isFormDisabled =
		isSubmitting || createMoveMutation.isPending || !!moveId;
	const isWarningName = nameLength > MOVE_NAME_WARNING_THRESHOLD;
	const isWarningDescriptionEn =
		descriptionEnLength > MOVE_DESCRIPTION_WARNING_THRESHOLD;
	const isWarningDescriptionPl =
		descriptionPlLength > MOVE_DESCRIPTION_WARNING_THRESHOLD;

	const stepsError = errors.steps?.message ?? errors.steps?.root?.message;

	return (
		<>
			<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
				<fieldset className="space-y-6" disabled={isFormDisabled}>
					<div>
						<Label className="mb-2 block font-medium text-sm" htmlFor="name">
							Move Name
						</Label>
						<Input
							aria-describedby={errors.name ? "name-error" : undefined}
							id="name"
							maxLength={MOVE_NAME_MAX_LENGTH}
							placeholder="e.g., Butterfly"
							{...register("name")}
						/>
						<div className="mt-1 flex items-center justify-between">
							{errors.name && (
								<div className="text-destructive text-sm" id="name-error">
									{errors.name.message}
								</div>
							)}
							<span
								className={
									isWarningName
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
							htmlFor="description-en"
						>
							Description (English)
						</Label>
						<Textarea
							aria-describedby={
								errors.descriptionEn ? "description-en-error" : undefined
							}
							className="max-w-2xl"
							id="description-en"
							maxLength={MOVE_DESCRIPTION_MAX_LENGTH}
							placeholder="Describe the move and its key characteristics..."
							rows={4}
							{...register("descriptionEn")}
						/>
						<div className="mt-1 flex items-center justify-between">
							{errors.descriptionEn && (
								<div
									className="text-destructive text-sm"
									id="description-en-error"
								>
									{errors.descriptionEn.message}
								</div>
							)}
							<span
								className={
									isWarningDescriptionEn
										? "text-amber-600 text-xs"
										: "text-muted-foreground text-xs"
								}
							>
								{descriptionEnLength}/{MOVE_DESCRIPTION_MAX_LENGTH}
							</span>
						</div>
					</div>

					<div>
						<Label
							className="mb-2 block font-medium text-sm"
							htmlFor="description-pl"
						>
							Description (Polish)
						</Label>
						<Textarea
							aria-describedby={
								errors.descriptionPl ? "description-pl-error" : undefined
							}
							className="max-w-2xl"
							id="description-pl"
							maxLength={MOVE_DESCRIPTION_MAX_LENGTH}
							placeholder="Opisz ruch i jego kluczowe cechy..."
							rows={4}
							{...register("descriptionPl")}
						/>
						<div className="mt-1 flex items-center justify-between">
							{errors.descriptionPl && (
								<div
									className="text-destructive text-sm"
									id="description-pl-error"
								>
									{errors.descriptionPl.message}
								</div>
							)}
							<span
								className={
									isWarningDescriptionPl
										? "text-amber-600 text-xs"
										: "text-muted-foreground text-xs"
								}
							>
								{descriptionPlLength}/{MOVE_DESCRIPTION_MAX_LENGTH}
							</span>
						</div>
					</div>

					<div>
						<Label className="mb-2 block font-medium text-sm" htmlFor="level">
							Difficulty Level
						</Label>
						<Controller
							control={control}
							name="level"
							render={({ field }) => (
								<Select onValueChange={field.onChange} value={field.value}>
									<SelectTrigger
										aria-describedby={errors.level ? "level-error" : undefined}
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
							)}
						/>
						{errors.level && (
							<div className="mt-1 text-destructive text-sm" id="level-error">
								{errors.level.message}
							</div>
						)}
					</div>

					<StepEditor
						errors={errors}
						fields={fields}
						onAddStep={handleAddStep}
						onRemoveStep={remove}
						register={register}
					/>

					{stepsError && (
						<Alert variant="destructive">
							<AlertDescription>{stepsError}</AlertDescription>
						</Alert>
					)}

					{createMoveMutation.isError && (
						<Alert variant="destructive">
							<AlertDescription>
								{createMoveMutation.error instanceof Error
									? createMoveMutation.error.message
									: "An unexpected error occurred"}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex gap-3">
						<Button
							className="flex-1"
							disabled={isSubmitting || createMoveMutation.isPending}
							type="submit"
						>
							{isSubmitting || createMoveMutation.isPending
								? "Creating..."
								: "Save Draft"}
						</Button>
						<Button
							disabled={isSubmitting || createMoveMutation.isPending}
							onClick={handleCancel}
							type="button"
							variant="outline"
						>
							Cancel
						</Button>
					</div>
				</fieldset>

				{moveId && (
					<>
						<div className="border-border border-t pt-6">
							<ImageGenerator
								isDisabled={false}
								moveId={moveId}
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
										setMoveId(null);
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

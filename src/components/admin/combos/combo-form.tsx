import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
	COMBO_NAME_MAX_LENGTH,
} from "@/utils/constants";
import { type ComboFormValues, comboFormSchema } from "../../../../form/schema";
import { ComboMovesSelector } from "./combo-moves-selector";
import { PublishSection } from "./publish-section";

function UnsavedChangesDialog({
	onKeepEditing,
	onDiscard,
}: {
	onKeepEditing: () => void;
	onDiscard: () => void;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="rounded-lg border border-border bg-card p-6 shadow-lg">
				<h2 className="mb-2 font-semibold text-lg">Discard Changes?</h2>
				<p className="mb-6 text-muted-foreground text-sm">
					You have unsaved changes. Do you want to leave without saving?
				</p>
				<div className="flex gap-3">
					<Button onClick={onKeepEditing} variant="outline">
						Keep Editing
					</Button>
					<Button onClick={onDiscard} variant="destructive">
						Discard Changes
					</Button>
				</div>
			</div>
		</div>
	);
}

export function ComboForm() {
	const navigate = useNavigate();
	const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
	const [comboId, setComboId] = useState<string | null>(null);

	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { errors, isDirty },
	} = useForm<ComboFormValues>({
		resolver: zodResolver(comboFormSchema),
		defaultValues: {
			name: "",
			descriptionEn: "",
			descriptionPl: "",
			level: undefined,
			moveIds: [],
		},
	});

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

	const onSubmit = async (data: ComboFormValues) => {
		await createComboMutation.mutateAsync(data);
	};

	const handlePublish = async () => {
		if (!comboId) {
			return;
		}
		await publishComboMutation.mutateAsync(comboId);
	};

	const handleCancel = () => {
		if (isDirty || comboId) {
			setShowUnsavedWarning(true);
		} else {
			navigate({ to: "/admin/combos" });
		}
	};

	const isFormDisabled =
		createComboMutation.isPending ||
		publishComboMutation.isPending ||
		!!comboId;

	const nameLength = watch("name").length;
	const descriptionEnLength = watch("descriptionEn").length;
	const descriptionPlLength = watch("descriptionPl").length;

	return (
		<>
			<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
				<fieldset className="space-y-6" disabled={isFormDisabled}>
					<div>
						<Label className="mb-2 block font-medium text-sm" htmlFor="name">
							Combo Name <span className="text-destructive">*</span>
						</Label>
						<Input
							aria-describedby={errors.name ? "name-error" : undefined}
							id="name"
							maxLength={COMBO_NAME_MAX_LENGTH}
							placeholder="e.g., Beginner Flow Combo"
							{...register("name")}
						/>
						<div className="mt-1 flex items-center justify-between">
							{errors.name && (
								<div className="text-destructive text-sm" id="name-error">
									{errors.name.message}
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

					<div>
						<Label
							className="mb-2 block font-medium text-sm"
							htmlFor="descriptionEn"
						>
							English Description <span className="text-destructive">*</span>
						</Label>
						<Textarea
							aria-describedby={
								errors.descriptionEn ? "descriptionEn-error" : undefined
							}
							id="descriptionEn"
							maxLength={COMBO_DESCRIPTION_MAX_LENGTH}
							placeholder="Describe the combo in English..."
							rows={4}
							{...register("descriptionEn")}
						/>
						<div className="mt-1 flex items-center justify-between">
							{errors.descriptionEn && (
								<div
									className="text-destructive text-sm"
									id="descriptionEn-error"
								>
									{errors.descriptionEn.message}
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
								errors.descriptionPl ? "descriptionPl-error" : undefined
							}
							id="descriptionPl"
							maxLength={COMBO_DESCRIPTION_MAX_LENGTH}
							placeholder="Opisz combo po polsku..."
							rows={4}
							{...register("descriptionPl")}
						/>
						<div className="mt-1 flex items-center justify-between">
							{errors.descriptionPl && (
								<div
									className="text-destructive text-sm"
									id="descriptionPl-error"
								>
									{errors.descriptionPl.message}
								</div>
							)}
							<span className="ml-auto text-muted-foreground text-xs">
								{descriptionPlLength}/{COMBO_DESCRIPTION_MAX_LENGTH}
							</span>
						</div>
					</div>

					<Controller
						control={control}
						name="moveIds"
						render={({ field }) => (
							<ComboMovesSelector
								disabled={isFormDisabled}
								error={errors.moveIds?.message}
								onChange={field.onChange}
								value={field.value}
							/>
						)}
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
					<PublishSection
						error={publishComboMutation.error}
						isError={publishComboMutation.isError}
						isPending={publishComboMutation.isPending}
						onPublish={handlePublish}
						onSaveAsDraft={() => navigate({ to: "/admin/combos" })}
					/>
				)}
			</form>

			{showUnsavedWarning && (
				<UnsavedChangesDialog
					onDiscard={() => {
						setShowUnsavedWarning(false);
						navigate({ to: "/admin/combos" });
					}}
					onKeepEditing={() => setShowUnsavedWarning(false)}
				/>
			)}
		</>
	);
}

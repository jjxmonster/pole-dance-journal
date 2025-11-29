import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/orpc/client";
import type { AdminUpdateComboInput } from "@/orpc/schema";
import {
	COMBO_MOVES_MIN_COUNT,
	COMBO_NAME_MAX_LENGTH,
	COMBO_NAME_MIN_LENGTH,
} from "@/utils/constants";
import { ComboMovesSelector } from "./combo-moves-selector";

type EditComboFormProps = {
	comboId: string;
};

type ComboFormState = {
	name: string;
	level: "Beginner" | "Intermediate" | "Advanced" | "";
	moveIds: string[];
};

export function EditComboForm({ comboId }: EditComboFormProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [formState, setFormState] = useState<ComboFormState>({
		name: "",
		level: "",
		moveIds: [],
	});
	const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
	const [hasFormChanged, setHasFormChanged] = useState(false);
	const [validationErrors, setValidationErrors] = useState<{
		name?: string;
		level?: string;
		moveIds?: string;
	}>({});

	const comboQuery = useQuery({
		queryKey: ["admin", "combo", comboId],
		queryFn: () => orpc.admin.combos.getCombo.call({ id: comboId }),
	});

	useEffect(() => {
		if (comboQuery.data?.combo) {
			const combo = comboQuery.data.combo;
			setFormState({
				name: combo.name,
				level: combo.level,
				moveIds: combo.moveIds,
			});
		}
	}, [comboQuery.data]);

	const updateComboMutation = useMutation({
		mutationFn: (data: AdminUpdateComboInput) =>
			orpc.admin.combos.updateCombo.call(data),
		onSuccess: () => {
			toast.success("Combo updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["admin", "combos"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "combo", comboId] });
			navigate({ to: "/admin/combos" });
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update combo";
			toast.error(errorMessage);
		},
	});

	const validateForm = (): boolean => {
		const errors: typeof validationErrors = {};

		if (!formState.name.trim()) {
			errors.name = "Name is required";
		} else if (formState.name.length < COMBO_NAME_MIN_LENGTH) {
			errors.name = `Name must be at least ${COMBO_NAME_MIN_LENGTH} characters`;
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

		await updateComboMutation.mutateAsync({
			id: comboId,
			name: formState.name,
			level: formState.level as "Beginner" | "Intermediate" | "Advanced",
			moveIds: formState.moveIds,
		});
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
		if (hasFormChanged) {
			setShowUnsavedWarning(true);
		} else {
			navigate({ to: "/admin/combos" });
		}
	};

	if (comboQuery.isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<Skeleton className="mb-2 h-5 w-24" />
					<Skeleton className="h-10 w-full" />
				</div>
				<div>
					<Skeleton className="mb-2 h-5 w-32" />
					<Skeleton className="h-10 w-full" />
				</div>
				<div>
					<Skeleton className="mb-2 h-5 w-40" />
					<Skeleton className="h-40 w-full" />
				</div>
			</div>
		);
	}

	if (comboQuery.isError) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					Failed to load combo. Please try again.
				</AlertDescription>
			</Alert>
		);
	}

	const isFormDisabled = updateComboMutation.isPending;
	const nameLength = formState.name.length;

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

					<ComboMovesSelector
						disabled={isFormDisabled}
						error={validationErrors.moveIds}
						onChange={handleMoveIdsChange}
						value={formState.moveIds}
					/>

					{updateComboMutation.isError && (
						<Alert variant="destructive">
							<AlertDescription>
								{updateComboMutation.error instanceof Error
									? updateComboMutation.error.message
									: "An unexpected error occurred"}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex gap-3">
						<Button
							className="flex-1"
							disabled={updateComboMutation.isPending}
							type="submit"
						>
							{updateComboMutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
						<Button
							disabled={updateComboMutation.isPending}
							onClick={handleCancel}
							type="button"
							variant="outline"
						>
							Cancel
						</Button>
					</div>
				</fieldset>
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

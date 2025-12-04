import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/orpc/client";
import type { AdminUpdateComboInput } from "@/orpc/schema";
import {
	COMBO_DESCRIPTION_MAX_LENGTH,
	COMBO_NAME_MAX_LENGTH,
} from "@/utils/constants";
import { type ComboFormValues, comboFormSchema } from "../../../../form/schema";
import { ComboMovesSelector } from "./combo-moves-selector";

type EditComboFormProps = {
	comboId: string;
};

export function EditComboForm({ comboId }: EditComboFormProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

	const {
		register,
		control,
		handleSubmit,
		watch,
		reset,
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

	const comboQuery = useQuery({
		queryKey: ["admin", "combo", comboId],
		queryFn: () => orpc.admin.combos.getCombo.call({ id: comboId }),
	});

	useEffect(() => {
		if (comboQuery.data?.combo) {
			const combo = comboQuery.data.combo;
			reset({
				name: combo.name,
				descriptionEn: combo.descriptionEn,
				descriptionPl: combo.descriptionPl,
				level: combo.level,
				moveIds: combo.moveIds,
			});
		}
	}, [comboQuery.data, reset]);

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

	const onSubmit = async (data: ComboFormValues) => {
		await updateComboMutation.mutateAsync({
			id: comboId,
			...data,
		});
	};

	const handleCancel = () => {
		if (isDirty) {
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

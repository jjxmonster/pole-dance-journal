import type { MoveFormValues, MoveStepValues } from "form/schema";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	MOVE_STEP_DESCRIPTION_MAX_LENGTH,
	MOVE_STEP_TITLE_MAX_LENGTH,
} from "@/utils/constants";

type StepInputGroupProps = {
	index: number;
	onRemove: (index: number) => void;
	register: UseFormRegister<MoveFormValues>;
	errors: FieldErrors<MoveStepValues> | undefined;
};

export function StepInputGroup({
	index,
	onRemove,
	register,
	errors,
}: StepInputGroupProps) {
	const stepNumber = index + 1;

	return (
		<div className="space-y-4 rounded-lg border border-input bg-card p-4">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-sm">Step {stepNumber}</h3>
				<Button
					className="text-destructive hover:bg-destructive/10 hover:text-destructive"
					onClick={() => onRemove(index)}
					size="sm"
					type="button"
					variant="ghost"
				>
					Remove
				</Button>
			</div>

			<div>
				<label
					className="mb-2 block font-medium text-sm"
					htmlFor={`step-title-en-${index}`}
				>
					Step Title (English)
				</label>
				<Input
					aria-describedby={
						errors?.titleEn ? `step-title-en-${index}-error` : undefined
					}
					className="max-w-2xl"
					id={`step-title-en-${index}`}
					maxLength={MOVE_STEP_TITLE_MAX_LENGTH}
					placeholder="e.g., Mount the pole"
					{...register(`steps.${index}.titleEn`)}
				/>
				<div className="mt-1 flex items-center justify-between">
					{errors?.titleEn && (
						<div
							className="text-destructive text-sm"
							id={`step-title-en-${index}-error`}
						>
							{errors.titleEn.message}
						</div>
					)}
					<span className="text-muted-foreground text-xs">
						/{MOVE_STEP_TITLE_MAX_LENGTH}
					</span>
				</div>
			</div>

			<div>
				<label
					className="mb-2 block font-medium text-sm"
					htmlFor={`step-title-pl-${index}`}
				>
					Step Title (Polish)
				</label>
				<Input
					aria-describedby={
						errors?.titlePl ? `step-title-pl-${index}-error` : undefined
					}
					className="max-w-2xl"
					id={`step-title-pl-${index}`}
					maxLength={MOVE_STEP_TITLE_MAX_LENGTH}
					placeholder="np., Wejdź na drążek"
					{...register(`steps.${index}.titlePl`)}
				/>
				<div className="mt-1 flex items-center justify-between">
					{errors?.titlePl && (
						<div
							className="text-destructive text-sm"
							id={`step-title-pl-${index}-error`}
						>
							{errors.titlePl.message}
						</div>
					)}
					<span className="text-muted-foreground text-xs">
						/{MOVE_STEP_TITLE_MAX_LENGTH}
					</span>
				</div>
			</div>

			<div>
				<label
					className="mb-2 block font-medium text-sm"
					htmlFor={`step-description-en-${index}`}
				>
					Step Description (English)
				</label>
				<Textarea
					aria-describedby={
						errors?.descriptionEn
							? `step-description-en-${index}-error`
							: undefined
					}
					className="max-w-2xl"
					id={`step-description-en-${index}`}
					maxLength={MOVE_STEP_DESCRIPTION_MAX_LENGTH}
					placeholder="Describe how to perform this step..."
					rows={3}
					{...register(`steps.${index}.descriptionEn`)}
				/>
				<div className="mt-1 flex items-center justify-between">
					{errors?.descriptionEn && (
						<div
							className="text-destructive text-sm"
							id={`step-description-en-${index}-error`}
						>
							{errors.descriptionEn.message}
						</div>
					)}
					<span className="text-muted-foreground text-xs">
						/{MOVE_STEP_DESCRIPTION_MAX_LENGTH}
					</span>
				</div>
			</div>

			<div>
				<label
					className="mb-2 block font-medium text-sm"
					htmlFor={`step-description-pl-${index}`}
				>
					Step Description (Polish)
				</label>
				<Textarea
					aria-describedby={
						errors?.descriptionPl
							? `step-description-pl-${index}-error`
							: undefined
					}
					className="max-w-2xl"
					id={`step-description-pl-${index}`}
					maxLength={MOVE_STEP_DESCRIPTION_MAX_LENGTH}
					placeholder="Opisz, jak wykonać ten krok..."
					rows={3}
					{...register(`steps.${index}.descriptionPl`)}
				/>
				<div className="mt-1 flex items-center justify-between">
					{errors?.descriptionPl && (
						<div
							className="text-destructive text-sm"
							id={`step-description-pl-${index}-error`}
						>
							{errors.descriptionPl.message}
						</div>
					)}
					<span className="text-muted-foreground text-xs">
						/{MOVE_STEP_DESCRIPTION_MAX_LENGTH}
					</span>
				</div>
			</div>
		</div>
	);
}

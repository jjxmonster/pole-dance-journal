import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	MOVE_STEP_DESCRIPTION_MAX_LENGTH,
	MOVE_STEP_TITLE_MAX_LENGTH,
} from "@/utils/constants";

type StepInputGroupProps = {
	step: {
		id: string;
		titleEn: string;
		titlePl: string;
		descriptionEn: string;
		descriptionPl: string;
	};
	index: number;
	onRemove: (index: number) => void;
	onChange: (
		index: number,
		field: "titleEn" | "titlePl" | "descriptionEn" | "descriptionPl",
		value: string
	) => void;
	error: {
		titleEn?: string;
		titlePl?: string;
		descriptionEn?: string;
		descriptionPl?: string;
	} | null;
};

export function StepInputGroup({
	step,
	index,
	onRemove,
	onChange,
	error,
}: StepInputGroupProps) {
	const stepNumber = index + 1;
	const titleEnLength = step.titleEn.length;
	const titlePlLength = step.titlePl.length;
	const descriptionEnLength = step.descriptionEn.length;
	const descriptionPlLength = step.descriptionPl.length;

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
						error?.titleEn ? `step-title-en-${index}-error` : undefined
					}
					className="max-w-2xl"
					id={`step-title-en-${index}`}
					maxLength={MOVE_STEP_TITLE_MAX_LENGTH}
					onChange={(e) => onChange(index, "titleEn", e.target.value)}
					placeholder="e.g., Mount the pole"
					value={step.titleEn}
				/>
				<div className="mt-1 flex items-center justify-between">
					{error?.titleEn && (
						<div
							className="text-destructive text-sm"
							id={`step-title-en-${index}-error`}
						>
							{error.titleEn}
						</div>
					)}
					<span
						className={`text-xs ${
							titleEnLength > MOVE_STEP_TITLE_MAX_LENGTH
								? "text-amber-600"
								: "text-muted-foreground"
						}`}
					>
						{titleEnLength}/{MOVE_STEP_TITLE_MAX_LENGTH}
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
						error?.titlePl ? `step-title-pl-${index}-error` : undefined
					}
					className="max-w-2xl"
					id={`step-title-pl-${index}`}
					maxLength={MOVE_STEP_TITLE_MAX_LENGTH}
					onChange={(e) => onChange(index, "titlePl", e.target.value)}
					placeholder="np., Wejdź na drążek"
					value={step.titlePl}
				/>
				<div className="mt-1 flex items-center justify-between">
					{error?.titlePl && (
						<div
							className="text-destructive text-sm"
							id={`step-title-pl-${index}-error`}
						>
							{error.titlePl}
						</div>
					)}
					<span
						className={`text-xs ${
							titlePlLength > MOVE_STEP_TITLE_MAX_LENGTH
								? "text-amber-600"
								: "text-muted-foreground"
						}`}
					>
						{titlePlLength}/{MOVE_STEP_TITLE_MAX_LENGTH}
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
						error?.descriptionEn
							? `step-description-en-${index}-error`
							: undefined
					}
					className="max-w-2xl"
					id={`step-description-en-${index}`}
					maxLength={MOVE_STEP_DESCRIPTION_MAX_LENGTH}
					onChange={(e) => onChange(index, "descriptionEn", e.target.value)}
					placeholder="Describe how to perform this step..."
					rows={3}
					value={step.descriptionEn}
				/>
				<div className="mt-1 flex items-center justify-between">
					{error?.descriptionEn && (
						<div
							className="text-destructive text-sm"
							id={`step-description-en-${index}-error`}
						>
							{error.descriptionEn}
						</div>
					)}
					<span
						className={`text-xs ${
							descriptionEnLength > MOVE_STEP_DESCRIPTION_MAX_LENGTH
								? "text-amber-600"
								: "text-muted-foreground"
						}`}
					>
						{descriptionEnLength}/{MOVE_STEP_DESCRIPTION_MAX_LENGTH}
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
						error?.descriptionPl
							? `step-description-pl-${index}-error`
							: undefined
					}
					className="max-w-2xl"
					id={`step-description-pl-${index}`}
					maxLength={MOVE_STEP_DESCRIPTION_MAX_LENGTH}
					onChange={(e) => onChange(index, "descriptionPl", e.target.value)}
					placeholder="Opisz, jak wykonać ten krok..."
					rows={3}
					value={step.descriptionPl}
				/>
				<div className="mt-1 flex items-center justify-between">
					{error?.descriptionPl && (
						<div
							className="text-destructive text-sm"
							id={`step-description-pl-${index}-error`}
						>
							{error.descriptionPl}
						</div>
					)}
					<span
						className={`text-xs ${
							descriptionPlLength > MOVE_STEP_DESCRIPTION_MAX_LENGTH
								? "text-amber-600"
								: "text-muted-foreground"
						}`}
					>
						{descriptionPlLength}/{MOVE_STEP_DESCRIPTION_MAX_LENGTH}
					</span>
				</div>
			</div>
		</div>
	);
}

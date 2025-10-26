import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	MOVE_DESCRIPTION_MAX_LENGTH,
	MOVE_STEP_TITLE_MAX_LENGTH,
} from "@/utils/constants";

type StepInputGroupProps = {
	step: {
		id: string;
		title: string;
		description: string;
	};
	index: number;
	onRemove: (index: number) => void;
	onChange: (
		index: number,
		field: "title" | "description",
		value: string
	) => void;
	error: { title?: string; description?: string } | null;
};

export function StepInputGroup({
	step,
	index,
	onRemove,
	onChange,
	error,
}: StepInputGroupProps) {
	const stepNumber = index + 1;
	const titleLength = step.title.length;
	const descriptionLength = step.description.length;

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
					htmlFor={`step-title-${index}`}
				>
					Step Title
				</label>
				<Input
					aria-describedby={
						error?.title ? `step-title-${index}-error` : undefined
					}
					id={`step-title-${index}`}
					maxLength={150}
					onChange={(e) => onChange(index, "title", e.target.value)}
					placeholder="e.g., Mount the pole"
					value={step.title}
				/>
				<div className="mt-1 flex items-center justify-between">
					{error?.title && (
						<div
							className="text-destructive text-sm"
							id={`step-title-${index}-error`}
						>
							{error.title}
						</div>
					)}
					<span
						className={`text-xs ${
							titleLength > MOVE_STEP_TITLE_MAX_LENGTH
								? "text-amber-600"
								: "text-muted-foreground"
						}`}
					>
						{titleLength}/150
					</span>
				</div>
			</div>

			<div>
				<label
					className="mb-2 block font-medium text-sm"
					htmlFor={`step-description-${index}`}
				>
					Step Description
				</label>
				<Textarea
					aria-describedby={
						error?.description ? `step-description-${index}-error` : undefined
					}
					id={`step-description-${index}`}
					maxLength={150}
					onChange={(e) => onChange(index, "description", e.target.value)}
					placeholder="Describe how to perform this step..."
					rows={3}
					value={step.description}
				/>
				<div className="mt-1 flex items-center justify-between">
					{error?.description && (
						<div
							className="text-destructive text-sm"
							id={`step-description-${index}-error`}
						>
							{error.description}
						</div>
					)}
					<span
						className={`text-xs ${
							descriptionLength > MOVE_DESCRIPTION_MAX_LENGTH
								? "text-amber-600"
								: "text-muted-foreground"
						}`}
					>
						{descriptionLength}/150
					</span>
				</div>
			</div>
		</div>
	);
}

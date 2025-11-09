import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { MOVE_STEPS_MAX_COUNT } from "@/utils/constants";
import { StepInputGroup } from "./step-input-group";

type StepViewModel = {
	id: string;
	titleEn: string;
	titlePl: string;
	descriptionEn: string;
	descriptionPl: string;
};

type StepEditorProps = {
	steps: StepViewModel[];
	onAddStep: () => void;
	onRemoveStep: (index: number) => void;
	onStepChange: (
		index: number,
		field: "titleEn" | "titlePl" | "descriptionEn" | "descriptionPl",
		value: string
	) => void;
	errors: z.ZodError | null;
	getStepErrors: (index: number) => {
		titleEn?: string;
		titlePl?: string;
		descriptionEn?: string;
		descriptionPl?: string;
	} | null;
};

export function StepEditor({
	steps,
	onAddStep,
	onRemoveStep,
	onStepChange,
	getStepErrors,
}: StepEditorProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-lg">Steps</h2>
				<span className="text-muted-foreground text-sm">
					{steps.length}/{MOVE_STEPS_MAX_COUNT}
				</span>
			</div>

			<div className="space-y-3">
				{steps.map((step, index) => (
					<StepInputGroup
						error={getStepErrors(index)}
						index={index}
						key={step.id}
						onChange={onStepChange}
						onRemove={onRemoveStep}
						step={step}
					/>
				))}
			</div>

			<Button
				className="w-full"
				disabled={steps.length >= MOVE_STEPS_MAX_COUNT}
				onClick={onAddStep}
				type="button"
				variant="outline"
			>
				+ Add Step
			</Button>

			{steps.length < 2 && (
				<p className="text-destructive text-sm">
					At least 2 steps are required
				</p>
			)}
		</div>
	);
}

import type { MoveFormValues } from "form/schema";
import type {
	FieldArrayWithId,
	FieldErrors,
	UseFormRegister,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { MOVE_STEPS_MAX_COUNT } from "@/utils/constants";
import { StepInputGroup } from "./step-input-group";

type StepEditorProps = {
	fields: FieldArrayWithId<MoveFormValues, "steps", "id">[];
	onAddStep: () => void;
	onRemoveStep: (index: number) => void;
	register: UseFormRegister<MoveFormValues>;
	errors: FieldErrors<MoveFormValues>;
};

export function StepEditor({
	fields,
	onAddStep,
	onRemoveStep,
	register,
	errors,
}: StepEditorProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-lg">Steps</h2>
				<span className="text-muted-foreground text-sm">
					{fields.length}/{MOVE_STEPS_MAX_COUNT}
				</span>
			</div>

			<div className="space-y-3">
				{fields.map((field, index) => (
					<StepInputGroup
						errors={errors.steps?.[index]}
						index={index}
						key={field.id}
						onRemove={onRemoveStep}
						register={register}
					/>
				))}
			</div>

			<Button
				className="w-full"
				disabled={fields.length >= MOVE_STEPS_MAX_COUNT}
				onClick={onAddStep}
				type="button"
				variant="outline"
			>
				+ Add Step
			</Button>

			{fields.length < 2 && (
				<p className="text-destructive text-sm">
					At least 2 steps are required
				</p>
			)}
		</div>
	);
}

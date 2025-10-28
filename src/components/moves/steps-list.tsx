import type { Step } from "@/types/move";
import { StepCard } from "./step-card";

type StepsListProps = {
	steps: Step[];
};

export function StepsList({ steps }: StepsListProps) {
	if (steps.length === 0) {
		return null;
	}

	const sortedSteps = [...steps].sort((a, b) => a.orderIndex - b.orderIndex);

	return (
		<section data-testid="steps-list">
			<h2 className="mb-4 font-bold text-2xl text-foreground">Steps</h2>
			<ol className="space-y-4">
				{sortedSteps.map((step) => (
					<StepCard
						description={step.description}
						key={step.orderIndex}
						orderIndex={step.orderIndex}
						title={step.title}
					/>
				))}
			</ol>
		</section>
	);
}

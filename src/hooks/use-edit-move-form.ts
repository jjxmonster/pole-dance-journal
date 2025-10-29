import { useCallback, useState } from "react";
import type { z } from "zod";
import {
	type AdminEditMoveInput,
	AdminEditMoveInputSchema,
} from "@/orpc/schema";

type StepViewModel = {
	id: string;
	title: string;
	description: string;
};

type MoveFormViewModel = {
	id: string;
	name: string;
	description: string;
	level: "Beginner" | "Intermediate" | "Advanced" | "";
	steps: StepViewModel[];
};

type UseEditMoveFormReturn = {
	formState: MoveFormViewModel;
	errors: z.ZodError | null;
	isSubmitting: boolean;
	handleInputChange: (
		field: "name" | "description" | "level",
		value: string
	) => void;
	handleStepChange: (
		index: number,
		field: "title" | "description",
		value: string
	) => void;
	addStep: () => void;
	removeStep: (index: number) => void;
	handleSubmit: (
		onSubmit: (data: AdminEditMoveInput) => Promise<void>
	) => Promise<void>;
	getStepErrors: (
		index: number
	) => { title?: string; description?: string } | null;
};

type InitialMoveData = {
	id: string;
	name: string;
	description: string;
	level: "Beginner" | "Intermediate" | "Advanced";
	steps: Array<{ orderIndex: number; title: string; description: string }>;
};

export function useEditMoveForm(
	initialData: InitialMoveData
): UseEditMoveFormReturn {
	const sortedSteps = [...initialData.steps].sort(
		(a, b) => a.orderIndex - b.orderIndex
	);

	const [formState, setFormState] = useState<MoveFormViewModel>({
		id: initialData.id,
		name: initialData.name,
		description: initialData.description,
		level: initialData.level,
		steps: sortedSteps.map((step) => ({
			id: crypto.randomUUID(),
			title: step.title,
			description: step.description,
		})),
	});

	const [errors, setErrors] = useState<z.ZodError | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange = useCallback(
		(field: "name" | "description" | "level", value: string) => {
			setFormState((prev) => ({
				...prev,
				[field]: value,
			}));
		},
		[]
	);

	const handleStepChange = useCallback(
		(index: number, field: "title" | "description", value: string) => {
			setFormState((prev) => ({
				...prev,
				steps: prev.steps.map((step, i) =>
					i === index ? { ...step, [field]: value } : step
				),
			}));
		},
		[]
	);

	const addStep = useCallback(() => {
		setFormState((prev) => ({
			...prev,
			steps: [
				...prev.steps,
				{ id: crypto.randomUUID(), title: "", description: "" },
			],
		}));
	}, []);

	const removeStep = useCallback((index: number) => {
		setFormState((prev) => ({
			...prev,
			steps: prev.steps.filter((_, i) => i !== index),
		}));
	}, []);

	const getStepErrors = useCallback(
		(index: number): { title?: string; description?: string } | null => {
			if (!errors) {
				return null;
			}

			const stepErrors = errors.issues.filter(
				(issue) =>
					Array.isArray(issue.path) &&
					issue.path[0] === "steps" &&
					issue.path[1] === index
			);

			if (stepErrors.length === 0) {
				return null;
			}

			const result: { title?: string; description?: string } = {};
			for (const error of stepErrors) {
				const field = error.path[2];
				if (field === "title" || field === "description") {
					result[field] = error.message;
				}
			}

			return Object.keys(result).length > 0 ? result : null;
		},
		[errors]
	);

	const handleSubmit = async (
		onSubmit: (data: AdminEditMoveInput) => Promise<void>
	): Promise<void> => {
		setErrors(null);

		const submitData = {
			id: formState.id,
			name: formState.name,
			description: formState.description,
			level: formState.level as "Beginner" | "Intermediate" | "Advanced",
			steps: formState.steps.map((step) => ({
				title: step.title,
				description: step.description,
			})),
		};

		const validation = AdminEditMoveInputSchema.safeParse(submitData);

		if (!validation.success) {
			setErrors(validation.error);
			return;
		}

		setIsSubmitting(true);
		try {
			await onSubmit(validation.data);
		} finally {
			setIsSubmitting(false);
		}
	};

	return {
		formState,
		errors,
		isSubmitting,
		handleInputChange,
		handleStepChange,
		addStep,
		removeStep,
		handleSubmit,
		getStepErrors,
	};
}

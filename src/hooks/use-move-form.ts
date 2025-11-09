import { useCallback, useState } from "react";
import type { z } from "zod";
import {
	type AdminCreateMoveInput,
	AdminCreateMoveInputSchema,
} from "@/orpc/schema";

type StepViewModel = {
	id: string;
	titleEn: string;
	titlePl: string;
	descriptionEn: string;
	descriptionPl: string;
};

type MoveFormViewModel = {
	name: string;
	descriptionEn: string;
	descriptionPl: string;
	level: "Beginner" | "Intermediate" | "Advanced" | "";
	steps: StepViewModel[];
};

type UseMoveFormReturn = {
	formState: MoveFormViewModel;
	errors: z.ZodError | null;
	isSubmitting: boolean;
	handleInputChange: (
		field: "name" | "descriptionEn" | "descriptionPl" | "level",
		value: string
	) => void;
	handleStepChange: (
		index: number,
		field: "titleEn" | "titlePl" | "descriptionEn" | "descriptionPl",
		value: string
	) => void;
	addStep: () => void;
	removeStep: (index: number) => void;
	handleSubmit: (
		onSubmit: (data: AdminCreateMoveInput) => Promise<void>
	) => Promise<void>;
	getStepErrors: (index: number) => {
		titleEn?: string;
		titlePl?: string;
		descriptionEn?: string;
		descriptionPl?: string;
	} | null;
};

export function useMoveForm(): UseMoveFormReturn {
	const [formState, setFormState] = useState<MoveFormViewModel>({
		name: "",
		descriptionEn: "",
		descriptionPl: "",
		level: "",
		steps: [
			{
				id: crypto.randomUUID(),
				titleEn: "",
				titlePl: "",
				descriptionEn: "",
				descriptionPl: "",
			},
			{
				id: crypto.randomUUID(),
				titleEn: "",
				titlePl: "",
				descriptionEn: "",
				descriptionPl: "",
			},
		],
	});

	const [errors, setErrors] = useState<z.ZodError | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange = useCallback(
		(
			field: "name" | "descriptionEn" | "descriptionPl" | "level",
			value: string
		) => {
			setFormState((prev) => ({
				...prev,
				[field]: value,
			}));
		},
		[]
	);

	const handleStepChange = useCallback(
		(
			index: number,
			field: "titleEn" | "titlePl" | "descriptionEn" | "descriptionPl",
			value: string
		) => {
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
				{
					id: crypto.randomUUID(),
					titleEn: "",
					titlePl: "",
					descriptionEn: "",
					descriptionPl: "",
				},
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
		(
			index: number
		): {
			titleEn?: string;
			titlePl?: string;
			descriptionEn?: string;
			descriptionPl?: string;
		} | null => {
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

			const result: {
				titleEn?: string;
				titlePl?: string;
				descriptionEn?: string;
				descriptionPl?: string;
			} = {};
			for (const error of stepErrors) {
				const field = error.path[2];
				if (
					field === "titleEn" ||
					field === "titlePl" ||
					field === "descriptionEn" ||
					field === "descriptionPl"
				) {
					result[field] = error.message;
				}
			}

			return Object.keys(result).length > 0 ? result : null;
		},
		[errors]
	);

	const handleSubmit = async (
		onSubmit: (data: AdminCreateMoveInput) => Promise<void>
	): Promise<void> => {
		setErrors(null);

		const submitData = {
			name: formState.name,
			descriptionEn: formState.descriptionEn,
			descriptionPl: formState.descriptionPl,
			level: formState.level as "Beginner" | "Intermediate" | "Advanced",
			steps: formState.steps.map((step) => ({
				titleEn: step.titleEn,
				titlePl: step.titlePl,
				descriptionEn: step.descriptionEn,
				descriptionPl: step.descriptionPl,
			})),
		};

		const validation = AdminCreateMoveInputSchema.safeParse(submitData);

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

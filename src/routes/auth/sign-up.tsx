import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const Route = createFileRoute("/auth/sign-up")({
	component: SignUpPage,
	beforeLoad: () => {
		// This would be replaced with actual session check
		// const { userId } = context.auth || {};
		// if (userId) {
		//   return navigate({ to: "/catalog" });
		// }
	},
});

function SignUpPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleSubmit = async (_values: { email: string; password: string }) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			// This would be replaced with actual auth implementation
			// await orpc.mutation("auth.register", values);

			// Mock successful registration for UI demo
			// biome-ignore lint/style/noMagicNumbers: mock
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Show success message or redirect based on email confirmation setting
			setSuccess(
				"Account created successfully! Check your email to confirm your account."
			);

			// If no email confirmation is required, redirect would happen here
			// navigate({ to: "/catalog" });
		} catch (err) {
			// Check for specific error types
			if (err instanceof Error && err.message.includes("already registered")) {
				setError("This email is already registered.");
			} else if (err instanceof Error && err.message.includes("password")) {
				setError("Password does not meet requirements.");
			} else {
				setError("An error occurred during registration. Please try again.");
			}
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthFormWrapper
			description="Enter your details below to create your account"
			error={error}
			success={success}
			title="Create an account"
		>
			<SignUpForm isLoading={isLoading} onSubmit={handleSubmit} />
		</AuthFormWrapper>
	);
}

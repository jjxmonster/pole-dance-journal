import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPasswordPage,
	beforeLoad: () => {
		// This would be replaced with actual session check
		// const { userId } = context.auth || {};
		// if (userId) {
		//   return navigate({ to: "/catalog" });
		// }
	},
});

function ForgotPasswordPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleSubmit = async (_values: { email: string }) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			// This would be replaced with actual auth implementation
			// await orpc.mutation("auth.forgotPassword", values);

			// Mock successful request for UI demo
			// biome-ignore lint/style/noMagicNumbers: mock
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Always show success message to avoid account enumeration
			setSuccess("If an account exists, we sent a reset link to your email.");
		} catch (err) {
			// We don't show specific errors for security reasons
			setSuccess("If an account exists, we sent a reset link to your email.");
			// But we still throw for potential logging/handling
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthFormWrapper
			description="Enter your email address and we'll send you a link to reset your password"
			error={error}
			success={success}
			title="Forgot password"
		>
			<ForgotPasswordForm isLoading={isLoading} onSubmit={handleSubmit} />
		</AuthFormWrapper>
	);
}

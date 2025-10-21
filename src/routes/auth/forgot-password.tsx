import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { orpc } from "@/orpc/client";

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleSubmit = async (values: { email: string }) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			await orpc.auth.forgotPassword.call(values);
			setSuccess("If an account exists, we sent a reset link to your email.");
		} catch {
			setSuccess("If an account exists, we sent a reset link to your email.");
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

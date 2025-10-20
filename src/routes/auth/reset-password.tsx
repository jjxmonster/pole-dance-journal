import {
	createFileRoute,
	Link,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { orpc } from "@/orpc/client";

const REDIRECT_DELAY_MS = 2000;

export const Route = createFileRoute("/auth/reset-password")({
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	const search = useSearch({ from: "/auth/reset-password" });
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);

	useEffect(() => {
		const code = (search as Record<string, unknown>)?.code;
		if (typeof code === "string" && code.length > 0) {
			setAccessToken(code);
		} else {
			setError("Reset link is invalid or expired.");
		}
	}, [search]);

	const handleSubmit = async (values: {
		newPassword: string;
		accessToken: string;
	}) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			await orpc.auth.resetPassword.call(values);
			setSuccess("Password has been reset successfully.");

			setTimeout(() => {
				navigate({ to: "/auth/sign-in" });
			}, REDIRECT_DELAY_MS);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Reset link is invalid or expired.";
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthFormWrapper
			description="Enter your new password below"
			error={error}
			success={success}
			title="Reset password"
		>
			{accessToken ? (
				<ResetPasswordForm
					accessToken={accessToken}
					isLoading={isLoading}
					onSubmit={handleSubmit}
				/>
			) : (
				<div className="text-center">
					<p className="mb-4">Reset link is invalid or expired.</p>
					<Link
						className="text-primary hover:underline"
						to="/auth/forgot-password"
					>
						Request a new reset link
					</Link>
				</div>
			)}
		</AuthFormWrapper>
	);
}

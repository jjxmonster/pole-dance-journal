import {
	createFileRoute,
	Link,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const Route = createFileRoute("/auth/reset-password")({
	component: ResetPasswordPage,
	beforeLoad: () => {
		// This would be replaced with actual session check
		// const { userId } = context.auth || {};
		// if (userId) {
		//   return navigate({ to: "/catalog" });
		// }
	},
});

function ResetPasswordPage() {
	const search = useSearch({ from: "/auth/reset-password" });
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);

	// Extract the token from URL query parameters
	useEffect(() => {
		const code = "200";
		if (typeof code === "string" && code.length > 0) {
			setAccessToken(code);
		} else {
			setError("Reset link is invalid or expired.");
		}
	}, [search]);

	const handleSubmit = async (_values: {
		newPassword: string;
		accessToken: string;
	}) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			// This would be replaced with actual auth implementation
			// await orpc.mutation("auth.resetPassword", values);

			// Mock successful reset for UI demo
			// biome-ignore lint/style/noMagicNumbers: mock
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setSuccess("Password has been reset successfully.");

			// Redirect to sign-in after a short delay
			setTimeout(() => {
				navigate({ to: "/auth/sign-in" });
				// biome-ignore lint/style/noMagicNumbers: mock
			}, 2000);
		} catch (err) {
			setError("Reset link is invalid or expired.");
			throw err;
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

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { SignInForm } from "@/components/auth/sign-in-form";
import { orpc } from "@/orpc/client";

export const Route = createFileRoute("/auth/sign-in")({
	component: SignInPage,
	head: () => ({
		meta: [
			{
				name: "description",
				content: "Sign in to your account",
			},
		],
	}),
});

function SignInPage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (values: { email: string; password: string }) => {
		setIsLoading(true);
		setError(null);

		try {
			await orpc.auth.login.call(values);
			const redirectTo = new URLSearchParams(window.location.search).get(
				"redirectTo"
			);
			await navigate({ to: redirectTo || "/catalog" });
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Invalid email or password.";
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthFormWrapper
			description="Enter your email below to sign in to your account"
			error={error}
			title="Sign in"
		>
			<SignInForm isLoading={isLoading} onSubmit={handleSubmit} />
		</AuthFormWrapper>
	);
}

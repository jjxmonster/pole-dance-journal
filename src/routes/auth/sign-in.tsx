import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { SignInForm } from "@/components/auth/sign-in-form";
import { useAuth } from "@/hooks/use-auth";
import { client, orpc } from "@/orpc/client";

export const Route = createFileRoute("/auth/sign-in")({
	component: SignInPage,
	beforeLoad: async () => {
		const session = await orpc.auth.getSession.call();
		if (session.userId) {
			throw redirect({ to: "/catalog" });
		}
	},
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
	const { setAuth } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (values: { email: string; password: string }) => {
		setIsLoading(true);
		setError(null);

		try {
			await orpc.auth.login.call(values);
			const session = await client.auth.getSession();

			setAuth({
				userId: session.userId,
				email: session.email,
				isAdmin: session.isAdmin,
				expiresAt: session.expiresAt,
			});
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

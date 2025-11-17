import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { SignInForm } from "@/components/auth/sign-in-form";
import { useAuth } from "@/hooks/use-auth";
import { client, orpc } from "@/orpc/client";
import { m } from "@/paraglide/messages";
import { sessionQueryOptions } from "@/query-options/auth";
import { translateErrorMessage } from "@/utils/error-messages";

export const Route = createFileRoute("/auth/sign-in")({
	component: SignInPage,
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.ensureQueryData(
			sessionQueryOptions()
		);
		if (session.userId) {
			throw redirect({ to: "/catalog" });
		}
	},
	head: () => ({
		meta: [
			{
				name: "description",
				content: m.auth_signin_meta_description(),
			},
		],
	}),
});

function SignInPage() {
	const queryClient = useQueryClient();
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
				avatarUrl: session.avatarUrl,
				name: session.name,
			});

			queryClient.setQueryData(["auth", "session"], session);

			const redirectTo = new URLSearchParams(window.location.search).get(
				"redirectTo"
			);
			await navigate({ to: redirectTo || "/catalog" });
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? translateErrorMessage(err.message)
					: m.auth_error_invalid_credentials();
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const redirectTo = new URLSearchParams(window.location.search).get(
				"redirectTo"
			);

			const oauthUrl = await orpc.auth.oauthStart.call({
				provider: "google",
				redirectTo:
					window.location.origin +
					"/auth/oauth-callback" +
					(redirectTo ? `?redirectTo=${redirectTo}` : ""),
			});

			if (oauthUrl?.url) {
				window.location.href = oauthUrl.url;
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? translateErrorMessage(err.message)
					: m.auth_error_oauth_start_failed();
			setError(errorMessage);
			setIsLoading(false);
		}
	};

	return (
		<AuthFormWrapper
			description={m.auth_signin_description()}
			error={error}
			title={m.auth_signin_title()}
		>
			<SignInForm
				isLoading={isLoading}
				onGoogleSignIn={handleGoogleSignIn}
				onSubmit={handleSubmit}
			/>
		</AuthFormWrapper>
	);
}

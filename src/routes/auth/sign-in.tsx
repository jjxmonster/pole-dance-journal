import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { SignInForm } from "@/components/auth/sign-in-form";

export const Route = createFileRoute("/auth/sign-in")({
	component: SignInPage,
	beforeLoad: () => {
		// This would be replaced with actual session check
		// const { userId } = context.auth || {};
		// if (userId) {
		//   return navigate({ to: "/catalog" });
		// }
	},
});

function SignInPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (_values: { email: string; password: string }) => {
		setIsLoading(true);
		setError(null);

		try {
			// This would be replaced with actual auth implementation
			// await orpc.mutation("auth.login", values);

			// Mock successful login for UI demo
			// biome-ignore lint/style/noMagicNumbers: mock
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Redirect would happen here
			// navigate({ to: "/catalog" });
		} catch (err) {
			setError("Invalid email or password.");
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// This would be replaced with actual OAuth implementation
			// const { url } = await orpc.mutation("auth.oauthStart", {
			//   provider: "google",
			//   redirectTo: window.location.origin + "/auth/oauth-callback",
			// });
			// window.location.href = url;

			// Mock for UI demo
			// biome-ignore lint/style/noMagicNumbers: mock
			await new Promise((resolve) => setTimeout(resolve, 1000));
		} catch {
			setError("Unable to start Google sign-in. Please try again.");
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
			<SignInForm
				isLoading={isLoading}
				onGoogleSignIn={handleGoogleSignIn}
				onSubmit={handleSubmit}
			/>
		</AuthFormWrapper>
	);
}

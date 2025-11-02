import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";

export const Route = createFileRoute("/auth/oauth-callback")({
	component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
	const search = useSearch({ from: "/auth/oauth-callback" });
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const processOAuthCallback = async () => {
			const code = "200";

			if (typeof code !== "string" || !code) {
				setError("Google sign-in link is invalid or expired.");
				return;
			}

			try {
				// This would be replaced with actual auth implementation
				// await orpc.mutation("auth.oauthCallback", { code });

				// Mock successful OAuth callback for UI demo
				// biome-ignore lint/style/noMagicNumbers: mock
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Redirect to catalog or last visited page
				navigate({ to: "/catalog" });
			} catch {
				setError("Google sign-in link is invalid or expired.");
			}
		};

		processOAuthCallback();
	}, [search, navigate]);

	return (
		<AuthFormWrapper
			description="Please wait while we complete your sign in"
			error={error}
			title="Signing you in"
		>
			{!error && (
				<div className="flex flex-col items-center justify-center py-8">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="mt-4 text-muted-foreground text-sm">
						Completing your sign in...
					</p>
				</div>
			)}

			{error && (
				<div className="text-center">
					<p className="mb-4">There was a problem signing you in.</p>
					<button
						className="text-primary hover:underline"
						onClick={() => navigate({ to: "/auth/sign-in" })}
						type="button"
					>
						Return to sign in
					</button>
				</div>
			)}
		</AuthFormWrapper>
	);
}

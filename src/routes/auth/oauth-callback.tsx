import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { useAuth } from "@/hooks/use-auth";
import { client, orpc } from "@/orpc/client";

export const Route = createFileRoute("/auth/oauth-callback")({
	component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
	const search = useSearch({ from: "/auth/oauth-callback" });
	const navigate = useNavigate();
	const { setAuth } = useAuth();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const processOAuthCallback = async () => {
			const code = (search as Record<string, string>).code;

			if (!code) {
				setError("Nieprawidłowy link logowania. Brak kodu autoryzacyjnego.");
				return;
			}

			try {
				await orpc.auth.oauthCallback.call({ code });
				const session = await client.auth.getSession();

				setAuth({
					userId: session.userId,
					email: session.email,
					isAdmin: session.isAdmin,
					expiresAt: session.expiresAt,
					avatarUrl: session.avatarUrl,
					name: session.name,
				});

				const redirectTo = (search as Record<string, string>).redirectTo;
				await navigate({ to: redirectTo || "/catalog" });
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Wystąpił problem podczas logowania.";
				setError(errorMessage);
			}
		};

		processOAuthCallback();
	}, [search, navigate, setAuth]);

	return (
		<AuthFormWrapper
			description="Prosimy o cierpliwość podczas logowania"
			error={error}
			title="Logowanie"
		>
			{!error && (
				<div className="flex flex-col items-center justify-center py-8">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="mt-4 text-muted-foreground text-sm">
						Trwa logowanie...
					</p>
				</div>
			)}

			{error && (
				<div className="text-center">
					<p className="mb-4">Wystąpił problem podczas logowania.</p>
					<button
						className="text-primary hover:underline"
						onClick={() => navigate({ to: "/auth/sign-in" })}
						type="button"
					>
						Wróć do logowania
					</button>
				</div>
			)}
		</AuthFormWrapper>
	);
}

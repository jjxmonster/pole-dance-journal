import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { useAuth } from "@/hooks/use-auth";
import { client, orpc } from "@/orpc/client";

export const Route = createFileRoute("/auth/sign-up")({
	component: SignUpPage,
});

function SignUpPage() {
	const { setAuth } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleSubmit = async (values: { email: string; password: string }) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			await orpc.auth.register.call(values);
			await orpc.auth.login.call(values);
			const session = await client.auth.getSession();
			setAuth({
				userId: session.userId,
				email: session.email,
				isAdmin: session.isAdmin,
				expiresAt: session.expiresAt,
			});
			setSuccess("Account created successfully! You are now signed in.");
		} catch (err) {
			if (err instanceof Error && err.message.includes("already registered")) {
				setError("This email is already registered.");
			} else if (err instanceof Error && err.message.includes("password")) {
				setError("Password does not meet requirements.");
			} else {
				setError("An error occurred during registration. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthFormWrapper
			description="Enter your details below to create your account"
			error={error}
			success={success}
			title="Create an account"
		>
			<SignUpForm isLoading={isLoading} onSubmit={handleSubmit} />
		</AuthFormWrapper>
	);
}

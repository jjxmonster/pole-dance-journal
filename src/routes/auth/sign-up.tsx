import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { orpc } from "@/orpc/client";
import { m } from "@/paraglide/messages";
import { translateErrorMessage } from "@/utils/error-messages";

export const Route = createFileRoute("/auth/sign-up")({
	component: SignUpPage,
	head: () => ({
		meta: [
			{
				title: m.auth_signup_meta_title(),
			},
			{
				name: "description",
				content: m.auth_signup_meta_description(),
			},
		],
	}),
});

function SignUpPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleSubmit = async (values: { email: string; password: string }) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			await orpc.auth.register.call(values);

			setSuccess(m.auth_signup_success());
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? translateErrorMessage(err.message)
					: m.auth_error_registration_failed();
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthFormWrapper
			description={m.auth_signup_description()}
			error={error}
			success={success}
			title={m.auth_signup_title()}
		>
			<SignUpForm isLoading={isLoading} onSubmit={handleSubmit} />
		</AuthFormWrapper>
	);
}

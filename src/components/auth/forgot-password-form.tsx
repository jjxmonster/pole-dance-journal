import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AuthEmailSchema = z
	.string()
	.trim()
	.email("Please enter a valid email address");

type ForgotPasswordFormProps = {
	onSubmit: (values: { email: string }) => Promise<void>;
	isLoading?: boolean;
};

export function ForgotPasswordForm({
	onSubmit,
	isLoading = false,
}: ForgotPasswordFormProps) {
	const [formError, setFormError] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState<string | null>(null);

	const validateEmail = (value: string) => {
		try {
			AuthEmailSchema.parse(value);
			setEmailError(null);
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				setEmailError(error.errors[0].message);
			}
			return false;
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!validateEmail(email)) {
			return;
		}

		try {
			setFormError(null);
			await onSubmit({ email });
		} catch (error) {
			setFormError(
				error instanceof Error ? error.message : "An unexpected error occurred"
			);
		}
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div>
				<label className="mb-2 block font-medium text-sm" htmlFor="email">
					Email
				</label>
				<Input
					aria-describedby={emailError ? "email-error" : undefined}
					autoComplete="email"
					disabled={isLoading}
					id="email"
					onBlur={() => validateEmail(email)}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="name@example.com"
					required
					type="email"
					value={email}
				/>
				{emailError && (
					<div className="mt-1 text-destructive text-sm" id="email-error">
						{emailError}
					</div>
				)}
			</div>

			{formError && (
				<div className="text-destructive text-sm" role="alert">
					{formError}
				</div>
			)}

			<Button
				className="w-full"
				disabled={isLoading || !email || !!emailError}
				type="submit"
			>
				{isLoading ? "Sending reset link..." : "Send reset link"}
			</Button>

			<div className="mt-6 text-center text-sm">
				Remember your password?{" "}
				<Link className="text-primary hover:underline" to="/auth/sign-in">
					Sign in
				</Link>
			</div>
		</form>
	);
}

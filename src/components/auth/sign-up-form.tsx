import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/utils/constants";
import { SignUpAuthEmailSchema, SignUpPasswordSchema } from "@/utils/schemas";

type SignUpFormProps = {
	onSubmit: (values: { email: string; password: string }) => Promise<void>;
	isLoading?: boolean;
	redirectTo?: string;
};

export function SignUpForm({
	onSubmit,
	isLoading = false,
	redirectTo,
}: SignUpFormProps) {
	const [formError, setFormError] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [emailError, setEmailError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [confirmPasswordError, setConfirmPasswordError] = useState<
		string | null
	>(null);

	const validateEmail = (value: string) => {
		try {
			SignUpAuthEmailSchema.parse(value);
			setEmailError(null);
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				setEmailError(error.errors[0].message);
			}
			return false;
		}
	};

	const validatePassword = (value: string) => {
		try {
			SignUpPasswordSchema.parse(value);
			setPasswordError(null);
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				setPasswordError(error.errors[0].message);
			}
			return false;
		}
	};

	const validateConfirmPassword = (value: string) => {
		if (value !== password) {
			setConfirmPasswordError("Passwords do not match");
			return false;
		}
		setConfirmPasswordError(null);
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const isEmailValid = validateEmail(email);
		const isPasswordValid = validatePassword(password);
		const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

		if (!(isEmailValid && isPasswordValid && isConfirmPasswordValid)) {
			return;
		}

		try {
			setFormError(null);
			await onSubmit({ email, password });
		} catch (error) {
			setFormError(
				error instanceof Error ? error.message : "An unexpected error occurred"
			);
		}
	};

	const hasRequiredFields = Boolean(email && password && confirmPassword);
	const hasNoErrors = Boolean(
		!(emailError || passwordError || confirmPasswordError)
	);
	const isFormValid = hasRequiredFields && hasNoErrors;

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

			<div>
				<label className="mb-2 block font-medium text-sm" htmlFor="password">
					Password
				</label>
				<Input
					aria-describedby={passwordError ? "password-error" : undefined}
					autoComplete="new-password"
					disabled={isLoading}
					id="password"
					onBlur={() => validatePassword(password)}
					onChange={(e) => {
						setPassword(e.target.value);
						if (confirmPassword) {
							validateConfirmPassword(confirmPassword);
						}
					}}
					required
					type="password"
					value={password}
				/>
				{passwordError && (
					<div className="mt-1 text-destructive text-sm" id="password-error">
						{passwordError}
					</div>
				)}
			</div>

			<div>
				<label
					className="mb-2 block font-medium text-sm"
					htmlFor="confirmPassword"
				>
					Confirm Password
				</label>
				<Input
					aria-describedby={
						confirmPasswordError ? "confirm-password-error" : undefined
					}
					autoComplete="new-password"
					disabled={isLoading}
					id="confirmPassword"
					onBlur={() => validateConfirmPassword(confirmPassword)}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
					type="password"
					value={confirmPassword}
				/>
				{confirmPasswordError && (
					<div
						className="mt-1 text-destructive text-sm"
						id="confirm-password-error"
					>
						{confirmPasswordError}
					</div>
				)}
			</div>

			<div className="rounded-md bg-muted p-3">
				<h3 className="font-medium text-sm">Password requirements:</h3>
				<ul className="mt-1 text-muted-foreground text-xs">
					<li>At least {MIN_PASSWORD_LENGTH} characters</li>
					<li>At most {MAX_PASSWORD_LENGTH} characters</li>
					<li>At least 1 letter and 1 number</li>
				</ul>
			</div>

			{formError && (
				<div className="text-destructive text-sm" role="alert">
					{formError}
				</div>
			)}

			<Button
				className="w-full"
				disabled={isLoading || !isFormValid}
				type="submit"
			>
				{isLoading ? "Creating account..." : "Create account"}
			</Button>

			<div className="mt-6 text-center text-sm">
				Already have an account?{" "}
				<Link className="text-primary hover:underline" to="/auth/sign-in">
					Sign in
				</Link>
			</div>

			{redirectTo && (
				<input name="redirectTo" type="hidden" value={redirectTo} />
			)}
		</form>
	);
}

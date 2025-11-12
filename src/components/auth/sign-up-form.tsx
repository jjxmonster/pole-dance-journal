import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { SignUpAuthEmailSchema, SignUpPasswordSchema } from "@/utils/schemas";
import { PasswordInput } from "./password-input";
import { PasswordRequirementsCheck } from "./password-requirements-check";

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
			setConfirmPasswordError(m.auth_signup_password_mismatch());
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
					{m.auth_signup_email_label()}
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
					{m.auth_signup_password_label()}
				</label>
				<PasswordInput
					autoComplete="new-password"
					disabled={isLoading}
					error={passwordError}
					errorId="password-error"
					id="password"
					onBlur={() => validatePassword(password)}
					onChange={(e) => {
						setPassword(e.target.value);
						if (confirmPassword) {
							validateConfirmPassword(confirmPassword);
						}
					}}
					required
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
					{m.auth_signup_confirm_password_label()}
				</label>
				<PasswordInput
					autoComplete="new-password"
					disabled={isLoading}
					error={confirmPasswordError}
					errorId="confirm-password-error"
					id="confirmPassword"
					onBlur={() => validateConfirmPassword(confirmPassword)}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
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

			<PasswordRequirementsCheck password={password} />

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
				{isLoading ? m.auth_signup_loading() : m.auth_signup_button()}
			</Button>

			<div className="text-center text-muted-foreground text-xs">
				{m.auth_signup_privacy_policy_text()}{" "}
				<Link
					className="text-primary hover:underline"
					to={`/privacy/${getLocale()}`}
				>
					{m.auth_signup_privacy_policy_link()}
				</Link>
			</div>

			<div className="mt-6 text-center text-sm">
				{m.auth_signup_have_account()}{" "}
				<Link className="text-primary hover:underline" to="/auth/sign-in">
					{m.auth_signup_signin_link()}
				</Link>
			</div>

			{redirectTo && (
				<input name="redirectTo" type="hidden" value={redirectTo} />
			)}
		</form>
	);
}

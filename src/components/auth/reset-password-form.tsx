import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Constants for password requirements
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

const PasswordSchema = z
	.string()
	.min(
		MIN_PASSWORD_LENGTH,
		`Password must be at least ${MIN_PASSWORD_LENGTH} characters`
	)
	.max(
		MAX_PASSWORD_LENGTH,
		`Password must be at most ${MAX_PASSWORD_LENGTH} characters`
	)
	.regex(
		/^(?=.*[A-Za-z])(?=.*\d).+$/,
		"Password must contain at least 1 letter and 1 number"
	);

type ResetPasswordFormProps = {
	onSubmit: (values: {
		newPassword: string;
		accessToken: string;
	}) => Promise<void>;
	isLoading?: boolean;
	accessToken: string;
};

export function ResetPasswordForm({
	onSubmit,
	isLoading = false,
	accessToken,
}: ResetPasswordFormProps) {
	const [formError, setFormError] = useState<string | null>(null);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
	const [confirmPasswordError, setConfirmPasswordError] = useState<
		string | null
	>(null);

	const validateNewPassword = (value: string) => {
		try {
			PasswordSchema.parse(value);
			setNewPasswordError(null);
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				setNewPasswordError(error.errors[0].message);
			}
			return false;
		}
	};

	const validateConfirmPassword = (value: string) => {
		if (value !== newPassword) {
			setConfirmPasswordError("Passwords do not match");
			return false;
		}
		setConfirmPasswordError(null);
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const isNewPasswordValid = validateNewPassword(newPassword);
		const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

		if (!(isNewPasswordValid && isConfirmPasswordValid)) {
			return;
		}

		try {
			setFormError(null);
			await onSubmit({
				newPassword,
				accessToken,
			});
		} catch (error) {
			setFormError(
				error instanceof Error ? error.message : "An unexpected error occurred"
			);
		}
	};

	const hasRequiredFields = Boolean(newPassword && confirmPassword);
	const hasNoErrors = Boolean(!(newPasswordError || confirmPasswordError));
	const isFormValid = hasRequiredFields && hasNoErrors;

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div>
				<label className="mb-2 block font-medium text-sm" htmlFor="newPassword">
					New Password
				</label>
				<Input
					aria-describedby={newPasswordError ? "new-password-error" : undefined}
					autoComplete="new-password"
					disabled={isLoading}
					id="newPassword"
					onBlur={() => validateNewPassword(newPassword)}
					onChange={(e) => {
						setNewPassword(e.target.value);
						if (confirmPassword) {
							validateConfirmPassword(confirmPassword);
						}
					}}
					required
					type="password"
					value={newPassword}
				/>
				{newPasswordError && (
					<div
						className="mt-1 text-destructive text-sm"
						id="new-password-error"
					>
						{newPasswordError}
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
				{isLoading ? "Resetting password..." : "Reset password"}
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

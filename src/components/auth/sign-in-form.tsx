import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignInAuthEmailSchema, SignInPasswordSchema } from "@/utils/schemas";

type SignInFormProps = {
	onSubmit: (values: { email: string; password: string }) => Promise<void>;
	isLoading?: boolean;
	onGoogleSignIn?: () => Promise<void>;
};

export function SignInForm({
	onSubmit,
	isLoading = false,
	onGoogleSignIn,
}: SignInFormProps) {
	const [formError, setFormError] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emailError, setEmailError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);

	const validateEmail = (value: string) => {
		try {
			SignInAuthEmailSchema.parse(value);
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
			SignInPasswordSchema.parse(value);
			setPasswordError(null);
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				setPasswordError(error.errors[0].message);
			}
			return false;
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const isEmailValid = validateEmail(email);
		const isPasswordValid = validatePassword(password);

		if (!(isEmailValid && isPasswordValid)) {
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

	const hasRequiredFields = Boolean(email && password);
	const hasNoErrors = Boolean(!(emailError || passwordError));
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
					data-testid="auth-input-email"
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
				<div className="mb-2 flex items-center justify-between">
					<label className="font-medium text-sm" htmlFor="password">
						Hasło
					</label>
					<Link
						className="text-primary text-xs hover:underline"
						to="/auth/forgot-password"
					>
						Zapomniałeś hasła?
					</Link>
				</div>
				<Input
					aria-describedby={passwordError ? "password-error" : undefined}
					autoComplete="current-password"
					data-testid="auth-input-password"
					disabled={isLoading}
					id="password"
					onBlur={() => validatePassword(password)}
					onChange={(e) => setPassword(e.target.value)}
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
				{isLoading ? "Logowanie..." : "Zaloguj się"}
			</Button>

			{onGoogleSignIn && (
				<>
					<div className="relative my-4">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">
								Lub zaloguj się za pomocą
							</span>
						</div>
					</div>

					<Button
						className="w-full"
						disabled={isLoading}
						onClick={() => onGoogleSignIn()}
						type="button"
						variant="outline"
					>
						<svg
							aria-hidden="true"
							className="mr-2 h-4 w-4"
							focusable="false"
							viewBox="0 0 24 24"
						>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Zaloguj się z Google
					</Button>
				</>
			)}

			<div className="mt-6 text-center text-sm">
				Nie masz jeszcze konta?{" "}
				<Link className="text-primary hover:underline" to="/auth/sign-up">
					Stwórz konto
				</Link>
			</div>
		</form>
	);
}

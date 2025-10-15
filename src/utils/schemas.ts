import { z } from "zod";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./constants";

export const SignInAuthEmailSchema = z
	.string()
	.trim()
	.email("Please enter a valid email address");
export const SignInPasswordSchema = z.string().min(1, "Password is required");

export const SignUpAuthEmailSchema = z
	.string()
	.trim()
	.email("Please enter a valid email address");
export const SignUpPasswordSchema = z
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

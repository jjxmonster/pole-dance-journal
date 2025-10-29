import { z } from "zod";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./constants";

export const SignInAuthEmailSchema = z
	.string()
	.trim()
	.email("Wprowadź poprawny adres e-mail");
export const SignInPasswordSchema = z.string().min(1, "Hasło jest wymagane");

export const SignUpAuthEmailSchema = z
	.string()
	.trim()
	.email("Wprowadź poprawny adres e-mail");
export const SignUpPasswordSchema = z
	.string()
	.min(
		MIN_PASSWORD_LENGTH,
		`Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków`
	)
	.max(
		MAX_PASSWORD_LENGTH,
		`Hasło musi mieć co najwyżej ${MAX_PASSWORD_LENGTH} znaków`
	)
	.regex(
		/^(?=.*[A-Za-z])(?=.*\d).+$/,
		"Hasło musi zawierać co najmniej 1 literę i 1 cyfrę"
	);

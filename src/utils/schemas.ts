import { z } from "zod";
import { m } from "@/paraglide/messages";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./constants";

export const SignInAuthEmailSchema = z
	.string()
	.trim()
	.email(m.validation_email_invalid());
export const SignInPasswordSchema = z
	.string()
	.min(1, m.validation_password_required());

export const SignUpAuthEmailSchema = z
	.string()
	.trim()
	.email(m.validation_email_invalid());
export const SignUpPasswordSchema = z
	.string()
	.min(
		MIN_PASSWORD_LENGTH,
		m.validation_password_min_length({ minLength: MIN_PASSWORD_LENGTH })
	)
	.max(
		MAX_PASSWORD_LENGTH,
		m.validation_password_max_length({ maxLength: MAX_PASSWORD_LENGTH })
	)
	.regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, m.validation_password_requirements());

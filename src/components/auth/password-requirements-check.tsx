import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/utils/constants";

type PasswordRequirements = {
	minLength: boolean;
	maxLength: boolean;
	hasLetterAndDigit: boolean;
};

type PasswordRequirementsCheckProps = {
	password: string;
};

const getPasswordRequirements = (password: string): PasswordRequirements => ({
	minLength: password.length >= MIN_PASSWORD_LENGTH,
	maxLength: password.length <= MAX_PASSWORD_LENGTH,
	// biome-ignore lint/performance/useTopLevelRegex: This is a top-level regex
	hasLetterAndDigit: /^(?=.*[A-Za-z])(?=.*\d).+$/.test(password),
});

export function PasswordRequirementsCheck({
	password,
}: PasswordRequirementsCheckProps) {
	const requirements = getPasswordRequirements(password);

	return (
		<div className="rounded-md bg-muted p-3">
			<h3 className="font-medium text-sm">Wymagania dotyczące hasła:</h3>
			<ul className="mt-1 text-muted-foreground text-xs">
				<li className={requirements.minLength ? "line-through" : ""}>
					Co najmniej {MIN_PASSWORD_LENGTH} znaków
				</li>
				<li className={requirements.maxLength ? "line-through" : ""}>
					Co najwyżej {MAX_PASSWORD_LENGTH} znaków
				</li>
				<li className={requirements.hasLetterAndDigit ? "line-through" : ""}>
					Co najmniej 1 literę i 1 cyfrę
				</li>
			</ul>
		</div>
	);
}

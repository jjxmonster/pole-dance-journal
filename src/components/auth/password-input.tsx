import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface PasswordInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: string | null;
	errorId?: string;
}

export function PasswordInput({
	error,
	errorId,
	disabled,
	...props
}: PasswordInputProps) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="relative">
			<Input
				{...props}
				aria-describedby={error ? errorId : undefined}
				disabled={disabled}
				type={showPassword ? "text" : "password"}
			/>
			<button
				aria-label={showPassword ? "Hide password" : "Show password"}
				className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
				disabled={disabled}
				onClick={() => setShowPassword(!showPassword)}
				tabIndex={-1}
				type="button"
			>
				{showPassword ? (
					<EyeOff className="h-4 w-4" />
				) : (
					<Eye className="h-4 w-4" />
				)}
			</button>
		</div>
	);
}

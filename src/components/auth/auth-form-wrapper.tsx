import type React from "react";
import { Card } from "@/components/ui/card";

type AuthFormWrapperProps = {
	title: string;
	description?: string;
	children: React.ReactNode;
	error?: string | null;
	success?: string | null;
};

export function AuthFormWrapper({
	title,
	description,
	children,
	error,
	success,
}: AuthFormWrapperProps) {
	return (
		<div className="flex min-h-[70vh] items-center justify-center p-4">
			<Card className="w-full max-w-md p-6 shadow-sm">
				<div className="mb-6 text-center">
					<h1 className="font-bold text-2xl tracking-tight">{title}</h1>
					{description && (
						<p className="mt-2 text-muted-foreground text-sm">{description}</p>
					)}
				</div>

				{error && (
					<div
						aria-live="polite"
						className="mb-4 rounded-md bg-destructive/15 p-3 text-destructive text-sm"
						role="alert"
					>
						{error}
					</div>
				)}

				{success && (
					<div
						aria-live="polite"
						className="mb-4 rounded-md bg-primary/15 p-3 text-primary text-sm"
					>
						{success}
					</div>
				)}

				{children}
			</Card>
		</div>
	);
}

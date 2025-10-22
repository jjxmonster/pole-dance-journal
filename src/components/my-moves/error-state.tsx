import { Button } from "../ui/button";

type ErrorStateProps = {
	onRetry: () => void;
};

export function ErrorState({ onRetry }: ErrorStateProps) {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
			<div className="mx-auto max-w-md">
				<h3 className="mb-2 font-semibold text-destructive text-lg">
					Wystąpił błąd
				</h3>
				<p className="mb-6 text-muted-foreground text-sm">
					Nie udało się załadować Twoich ruchów. Spróbuj ponownie.
				</p>
				<Button onClick={onRetry} type="button" variant="outline">
					Spróbuj ponownie
				</Button>
			</div>
		</div>
	);
}

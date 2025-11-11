import { m } from "@/paraglide/messages";
import { Button } from "../ui/button";

type ErrorStateProps = {
	onRetry: () => void;
};

export function ErrorState({ onRetry }: ErrorStateProps) {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
			<div className="mx-auto max-w-md">
				<h3 className="mb-2 font-semibold text-destructive text-lg">
					{m.my_moves_error_title()}
				</h3>
				<p className="mb-6 text-muted-foreground text-sm">
					{m.my_moves_error_description()}
				</p>
				<Button onClick={onRetry} type="button" variant="outline">
					{m.my_moves_error_retry_button()}
				</Button>
			</div>
		</div>
	);
}

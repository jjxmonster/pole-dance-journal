import { Link } from "@tanstack/react-router";
import { m } from "@/paraglide/messages";
import { Button } from "../ui/button";

export function EmptyState() {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
			<div className="mx-auto max-w-md">
				<h3 className="mb-2 font-semibold text-lg">
					{m.my_moves_empty_title()}
				</h3>
				<p className="mb-6 text-muted-foreground text-sm">
					{m.my_moves_empty_description()}
				</p>
				<Button asChild type="button">
					<Link to="/catalog">{m.my_moves_empty_button()}</Link>
				</Button>
			</div>
		</div>
	);
}

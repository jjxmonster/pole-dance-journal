import { Link } from "@tanstack/react-router";
import { ArrowLeft, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminCombosHeader() {
	return (
		<header className="mb-8">
			<div className="mb-4">
				<Link
					className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
					to="/admin"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Dashboard
				</Link>
			</div>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Manage Combos</h1>
					<p className="mt-1 text-muted-foreground">
						Create, edit, and manage combo sets for the catalog.
					</p>
				</div>
				<Button asChild type="button">
					<Link to="/admin/combos/new">
						<PlusIcon className="mr-2 size-4" />
						Create Combo
					</Link>
				</Button>
			</div>
		</header>
	);
}

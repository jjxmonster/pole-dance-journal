import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminMovesHeader() {
	return (
		<header className="mb-8">
			<div className="flex items-center justify-between">
				<h1 className="mb-2 font-bold text-4xl">Manage Moves</h1>
				<Button asChild type="button" variant="outline">
					<Link to="/admin/moves/new">
						<PlusIcon className="mr-2 size-4" />
						Create New Move
					</Link>
				</Button>
			</div>
			<p className="text-muted-foreground">
				View, filter, and manage all moves in your catalog including published,
				unpublished, and deleted moves.
			</p>
		</header>
	);
}

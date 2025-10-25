import { createFileRoute } from "@tanstack/react-router";
import { MoveForm } from "@/components/admin/moves/move-form";

export const Route = createFileRoute("/admin/moves/new")({
	component: CreateMoveView,
});

function CreateMoveView() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<header className="mb-8">
					<h1 className="font-bold text-3xl">Create New Move</h1>
					<p className="mt-2 text-muted-foreground">
						Add a new move to the catalog. Start by filling in the basic details
						and steps, then generate an image, and finally publish.
					</p>
				</header>

				<div className="max-w-2xl">
					<MoveForm />
				</div>
			</div>
		</div>
	);
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/moves/$slug")({
	component: MoveDetailView,
});

function MoveDetailView() {
	const { slug } = Route.useParams();

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<h1 className="mb-4 font-semibold text-4xl">Move Detail</h1>
			<p className="text-muted-foreground">
				Showing details for move: <span className="font-semibold">{slug}</span>
			</p>
			<p className="mt-4 text-muted-foreground text-sm">
				This page will be implemented in the next phase.
			</p>
		</div>
	);
}

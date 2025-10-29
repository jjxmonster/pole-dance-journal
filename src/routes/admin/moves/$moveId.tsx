import { createFileRoute, notFound } from "@tanstack/react-router";
import { EditMoveForm } from "@/components/admin/moves/edit-move-form";
import { orpc } from "@/orpc/client";

export const Route = createFileRoute("/admin/moves/$moveId")({
	component: EditMoveView,
	loader: async ({ params, context }) => {
		const move = await context.queryClient.ensureQueryData(
			orpc.admin.moves.getMove.queryOptions({
				input: { id: params.moveId },
			})
		);

		if (!move) {
			throw notFound();
		}

		return { move };
	},
});

function EditMoveView() {
	const { move } = Route.useLoaderData();

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<header className="mb-8">
					<h1 className="font-bold text-3xl">Edit Move</h1>
					<p className="mt-2 text-muted-foreground">
						Update the move details, regenerate the image if needed, and
						republish.
					</p>
				</header>

				<div className="max-w-2xl">
					<EditMoveForm move={move} />
				</div>
			</div>
		</div>
	);
}

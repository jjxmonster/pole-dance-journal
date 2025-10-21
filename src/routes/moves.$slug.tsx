import { createFileRoute, notFound } from "@tanstack/react-router";
import { Breadcrumbs } from "../components/moves/breadcrumbs";
import { MoveDescription } from "../components/moves/move-description";
import { MoveImage } from "../components/moves/move-image";
import { NoteEditor } from "../components/moves/note-editor";
import { StatusButtons } from "../components/moves/status-buttons";
import { StepsList } from "../components/moves/steps-list";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../hooks/use-auth";
import { useMoveStatus } from "../hooks/use-move-status";
import { orpc } from "../orpc/client";

export const Route = createFileRoute("/moves/$slug")({
	loader: async ({ params, context }) => {
		const move = await context.queryClient.ensureQueryData(
			orpc.moves.getBySlug.queryOptions({
				input: { slug: params.slug },
			})
		);

		if (!move) {
			throw notFound();
		}

		return { move };
	},
	head: ({ loaderData }) => {
		if (!loaderData) {
			return {
				meta: [
					{
						title: "Move Not Found - Spinella",
					},
				],
			};
		}

		const { move } = loaderData;

		return {
			meta: [
				{
					title: `${move.name} - Spinella`,
				},
				{
					name: "description",
					content: move.description,
				},
				{
					property: "og:title",
					content: `${move.name} - Spinella`,
				},
				{
					property: "og:description",
					content: move.description,
				},
				{
					property: "og:type",
					content: "article",
				},
				{
					name: "twitter:card",
					content: "summary_large_image",
				},
				{
					name: "twitter:title",
					content: `${move.name} - Spinella`,
				},
				{
					name: "twitter:description",
					content: move.description,
				},
			],
		};
	},
	component: MoveDetailPage,
});

function MoveDetailPage() {
	const { move } = Route.useLoaderData();
	const { isAuthenticated } = useAuth();
	const {
		status,
		updateStatus,
		isLoading: isStatusLoading,
	} = useMoveStatus(move.id);

	return (
		<div className="container mx-auto max-w-5xl px-4 py-8">
			<Breadcrumbs moveName={move.name} />

			<div className="space-y-8">
				<MoveImage
					alt={`${move.name} pole dance move illustration`}
					imageUrl={move.imageUrl}
				/>

				<header>
					<h1 className="mb-4 font-bold text-4xl text-foreground">
						{move.name}
					</h1>
					<Badge variant="default">{move.level}</Badge>
				</header>

				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					<div className="space-y-4 md:col-span-2">
						<MoveDescription description={move.description} />
						<StepsList steps={move.steps} />
					</div>

					{isAuthenticated && (
						<div className="space-y-6 md:col-span-1">
							<StatusButtons
								disabled={isStatusLoading}
								onChange={updateStatus}
								value={status}
							/>

							<NoteEditor initialNote={null} moveId={move.id} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

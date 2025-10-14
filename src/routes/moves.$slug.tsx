import { createFileRoute, notFound } from "@tanstack/react-router";
import { Breadcrumbs } from "../components/moves/breadcrumbs";
import { MoveDescription } from "../components/moves/move-description";
import { MoveImage } from "../components/moves/move-image";
import { StepsList } from "../components/moves/steps-list";
import { Badge } from "../components/ui/badge";
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

	return (
		<div className="container mx-auto max-w-5xl px-4 py-8">
			<Breadcrumbs moveName={move.name} />

			<div className="space-y-8">
				<header>
					<h1 className="mb-4 font-bold text-4xl text-foreground">
						{move.name}
					</h1>
					<Badge variant="default">{move.level}</Badge>
				</header>

				<MoveImage
					alt={`${move.name} pole dance move illustration`}
					imageUrl={move.imageUrl}
				/>

				<MoveDescription description={move.description} />

				<StepsList steps={move.steps} />
			</div>
		</div>
	);
}

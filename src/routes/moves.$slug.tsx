import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { LEVEL_COLORS } from "@/utils/constants";
import { Breadcrumbs } from "../components/moves/breadcrumbs";
import { MoveDescription } from "../components/moves/move-description";
import { MoveImage } from "../components/moves/move-image";
import { NoteEditor } from "../components/moves/note-editor";
import { StatusButtons } from "../components/moves/status-buttons";
import { StepsList } from "../components/moves/steps-list";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../hooks/use-auth";
import { useMoveStatus } from "../hooks/use-move-status";
import { orpc } from "../orpc/client";
import { m } from "../paraglide/messages";
import { sessionQueryOptions } from "../query-options/auth";

const getLevelLabel = (level: string): string => {
	switch (level) {
		case "Beginner":
			return m.catalog_level_beginner();
		case "Intermediate":
			return m.catalog_level_intermediate();
		case "Advanced":
			return m.catalog_level_advanced();
		default:
			return level;
	}
};

export const Route = createFileRoute("/moves/$slug")({
	loader: async ({ params, context }) => {
		const session = await context.queryClient.ensureQueryData(
			sessionQueryOptions()
		);
		if (!session.userId) {
			throw redirect({ to: "/auth/sign-in" });
		}

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
						title: "Figura Nie Znaleziona - Spinella",
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

	useEffect(() => {
		if (typeof window !== "undefined") {
			window.scrollTo(0, 0);
		}
	}, []);

	return (
		<div
			className="container mx-auto max-w-7xl py-8 xl:px-0"
			data-testid="move-details-page"
		>
			<Breadcrumbs moveName={move.name} />

			{move.translationFallback && (
				<Alert className="mb-8" variant="destructive">
					<AlertDescription>
						Translation for English is in progress, please check back later.
					</AlertDescription>
				</Alert>
			)}

			<div className="space-y-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					<div className="order-last space-y-4 md:order-none md:col-span-2">
						<header>
							<h1
								className="mb-4 font-bold text-4xl text-foreground"
								data-testid="move-title"
							>
								{move.name}
							</h1>
							<Badge className={LEVEL_COLORS[move.level]} variant="secondary">
								{getLevelLabel(move.level)}
							</Badge>
						</header>
						<MoveDescription description={move.description} />
						<StepsList steps={move.steps} />
						{isAuthenticated && <NoteEditor moveId={move.id} />}
					</div>

					<div
						className="order-first space-y-6 md:order-none md:col-span-1"
						data-testid="user-interaction-panel"
					>
						<MoveImage
							alt={`${move.name} figura pole dance`}
							imageUrl={move.imageUrl}
						/>
						{isAuthenticated && (
							<StatusButtons
								disabled={isStatusLoading}
								onChange={updateStatus}
								value={status}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

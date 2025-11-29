import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { orpc } from "@/orpc/client";
import { m } from "@/paraglide/messages";
import { LEVEL_COLORS, STALE_TIME_MS } from "@/utils/constants";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";

export const Route = createFileRoute("/combos/$slug")({
	component: ComboDetailView,

	head: ({ params }) => ({
		meta: [
			{
				title: `${params.slug} - ${m.combos_meta_title()}`,
			},
		],
	}),
});

const getLevelLabel = (
	level: "Beginner" | "Intermediate" | "Advanced"
): string => {
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

const FALLBACK_IMAGE = "/move.jpg";

function ComboDetailView() {
	const { slug } = Route.useParams();
	const { session } = useLoaderData({ from: "__root__" });
	const { isAuthenticated } = useAuth();
	const queryClient = useQueryClient();

	const comboQuery = useQuery(
		orpc.combos.getBySlug.queryOptions({
			input: { slug },
			staleTime: STALE_TIME_MS,
		})
	);

	const toggleFavoriteMutation = useMutation({
		mutationFn: async (comboId: string) =>
			await orpc.combos.toggleFavorite.call({ comboId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["combos"] });
		},
	});

	const { data: combo, isLoading, error } = comboQuery;

	if (!session?.userId) {
		return (
			<div className="container mx-auto max-w-7xl py-8">
				<div className="py-12 text-center">
					<p className="text-lg text-muted-foreground">
						{m.combos_auth_required()}
					</p>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-7xl py-8">
				<div className="mb-6">
					<Skeleton className="mb-4 h-8 w-32" />
					<Skeleton className="mb-2 h-10 w-3/4" />
					<Skeleton className="h-6 w-24" />
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((key) => (
						<Skeleton className="aspect-[4/3] w-full rounded-xl" key={key} />
					))}
				</div>
			</div>
		);
	}

	if (error || !combo) {
		return (
			<div className="container mx-auto max-w-7xl py-8">
				<div className="py-12 text-center">
					<p className="font-medium text-destructive text-lg">
						{m.combos_error_title()}
					</p>
					<p className="mt-2 text-muted-foreground text-sm">
						{m.combos_error_description()}
					</p>
					<Button asChild className="mt-4" variant="outline">
						<Link to="/combos">{m.combos_back_to_list()}</Link>
					</Button>
				</div>
			</div>
		);
	}

	const handleToggleFavorite = () => {
		if (isAuthenticated) {
			toggleFavoriteMutation.mutate(combo.id);
		}
	};

	return (
		<div className="container mx-auto max-w-7xl py-8">
			<div className="mb-6">
				<Link
					className="mb-4 inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
					to="/combos"
				>
					<ArrowLeft className="h-4 w-4" />
					{m.combos_back_to_list()}
				</Link>

				<div className="flex items-start justify-between">
					<div>
						<h1 className="mb-2 font-bold text-3xl tracking-tight md:text-4xl">
							{combo.name}
						</h1>
						<div className="flex items-center gap-3">
							<Badge className={LEVEL_COLORS[combo.level]} variant="secondary">
								{getLevelLabel(combo.level)}
							</Badge>
							<span className="text-muted-foreground text-sm">
								{m.combos_moves_count({ count: combo.moves.length.toString() })}
							</span>
						</div>
					</div>

					{isAuthenticated && (
						<Button
							aria-label={m.combos_favorite_toggle()}
							className="rounded-full"
							onClick={handleToggleFavorite}
							size="icon"
							variant="outline"
						>
							<Heart
								className={`h-5 w-5 ${combo.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
							/>
						</Button>
					)}
				</div>
			</div>

			<div className="mb-8">
				<h2 className="mb-4 font-semibold text-xl">
					{m.combos_moves_in_combo()}
				</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{combo.moves.map((move) => (
						<Link
							className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							key={move.id}
							params={{ slug: move.slug }}
							to="/moves/$slug"
						>
							<Card className="relative h-full gap-0 py-0 transition-shadow group-hover:shadow-lg">
								<div className="-top-2 -left-2 absolute z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
									{move.orderIndex}
								</div>
								<div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl">
									<img
										alt={`${move.name} - pole dance move`}
										className="h-full w-full object-cover transition-transform group-hover:scale-105"
										src={move.imageUrl || FALLBACK_IMAGE}
									/>
								</div>
								<CardContent className="space-y-1 p-3">
									<h3 className="mb-0 font-semibold text-base group-hover:text-primary">
										{move.name}
									</h3>
									<Badge
										className={LEVEL_COLORS[move.level]}
										variant="secondary"
									>
										{getLevelLabel(move.level)}
									</Badge>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}

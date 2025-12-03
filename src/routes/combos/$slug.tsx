import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	notFound,
	redirect,
	useLoaderData,
} from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { orpc } from "@/orpc/client";
import { m } from "@/paraglide/messages";
import { sessionQueryOptions } from "@/query-options/auth";
import { LEVEL_COLORS, STALE_TIME_MS } from "@/utils/constants";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";

export const Route = createFileRoute("/combos/$slug")({
	component: ComboDetailView,
	loader: async ({ params, context }) => {
		const session = await context.queryClient.ensureQueryData(
			sessionQueryOptions()
		);
		if (!session.userId) {
			throw redirect({ to: "/auth/sign-in" });
		}

		const combo = await context.queryClient.ensureQueryData(
			orpc.combos.getBySlug.queryOptions({
				input: { slug: params.slug },
				staleTime: STALE_TIME_MS,
				queryKey: ["combo", params.slug],
			})
		);

		if (!combo) {
			throw notFound();
		}

		return { combo };
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: `${loaderData?.combo.name} - ${m.combos_meta_title()}`,
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
			queryKey: ["combo", slug],
		})
	);

	const toggleFavoriteMutation = useMutation({
		mutationFn: async (comboId: string) =>
			await orpc.combos.toggleFavorite.call({ comboId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["combo", slug] });
		},
	});

	const { data: combo, isLoading, error } = comboQuery;

	if (!session?.userId) {
		return (
			<div className="container mx-auto max-w-3xl py-8">
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
			<div className="container mx-auto max-w-3xl py-8">
				<div className="mb-8 text-center">
					<Skeleton className="mx-auto mb-4 h-10 w-64" />
					<Skeleton className="mx-auto h-6 w-32" />
				</div>
				<div className="flex flex-col items-center gap-4">
					{Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map(
						(key, index) => (
							<div className="w-full max-w-xl" key={key}>
								<Skeleton className="h-48 w-full rounded-xl" />
								{index < 2 && (
									<div className="flex justify-center py-3">
										<Skeleton className="h-6 w-6 rounded-full" />
									</div>
								)}
							</div>
						)
					)}
				</div>
			</div>
		);
	}

	if (error || !combo) {
		return (
			<div className="container mx-auto max-w-3xl py-8">
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
		<div className="container mx-auto max-w-3xl py-8">
			<div className="mb-8 flex items-center justify-between">
				<Link
					className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
					to="/combos"
				>
					<ArrowLeft className="h-4 w-4" />
					{m.combos_back_to_list()}
				</Link>

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

			<div className="mb-10 text-center">
				<h1 className="mb-3 font-serif text-4xl italic tracking-tight md:text-5xl">
					{combo.name}
				</h1>
				<div className="flex items-center justify-center gap-3">
					<Badge className={LEVEL_COLORS[combo.level]} variant="secondary">
						{getLevelLabel(combo.level)}
					</Badge>
					<span className="text-muted-foreground text-sm">
						{m.combos_moves_count({ count: combo.moves.length.toString() })}
					</span>
				</div>
				{combo.description && (
					<p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
						{combo.description}
					</p>
				)}
			</div>

			<div className="flex flex-col items-center">
				{combo.moves.map((move, index) => (
					<div className="w-full max-w-xl" key={move.id}>
						<Link
							className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							params={{ slug: move.slug }}
							to="/moves/$slug"
						>
							<div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow group-hover:shadow-lg">
								<div className="flex flex-col sm:flex-row">
									<div className="relative aspect-square w-full shrink-0 overflow-hidden sm:w-40">
										<img
											alt={`${move.name} - pole dance move`}
											className="h-full w-full object-cover transition-transform group-hover:scale-105"
											src={move.imageUrl ?? FALLBACK_IMAGE}
										/>
									</div>
									<div className="flex flex-1 flex-col justify-center p-4">
										<span className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wider">
											{m.combos_step_label({
												number: move.orderIndex.toString(),
											})}
										</span>
										<h3 className="mb-2 font-bold text-lg group-hover:text-primary">
											{move.name}
										</h3>
										{move.description && (
											<p className="line-clamp-2 text-muted-foreground text-sm">
												{move.description}
											</p>
										)}
									</div>
								</div>
							</div>
						</Link>

						{index < combo.moves.length - 1 && (
							<div className="flex justify-center py-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
									<ArrowDown className="h-4 w-4 text-muted-foreground" />
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

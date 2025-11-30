import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { orpc } from "@/orpc/client";
import { m } from "@/paraglide/messages";
import { COMBO_MOVES_DISPLAY_COUNT, LEVEL_COLORS } from "@/utils/constants";
import type { ComboListItemSchema } from "../../orpc/schema";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type ComboDTO = z.infer<typeof ComboListItemSchema>;

type ComboCardProps = {
	combo: ComboDTO;
};

const getLevelLabel = (level: ComboDTO["level"]): string => {
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

export function ComboCard({ combo }: ComboCardProps) {
	const { isAuthenticated } = useAuth();
	const queryClient = useQueryClient();

	const toggleFavoriteMutation = useMutation({
		mutationFn: async () =>
			orpc.combos.toggleFavorite.call({ comboId: combo.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["combos"] });
		},
	});

	const handleToggleFavorite = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (isAuthenticated) {
			toggleFavoriteMutation.mutate();
		}
	};

	return (
		<Link
			className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			data-testid="combo-card"
			params={{ slug: combo.slug }}
			to="/combos/$slug"
		>
			<Card className="relative h-full gap-0 py-0 transition-shadow group-hover:shadow-lg">
				{isAuthenticated && (
					<Button
						aria-label={m.combos_favorite_toggle()}
						className="absolute top-2 right-2 z-10 cursor-pointer rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
						onClick={handleToggleFavorite}
						size="icon-sm"
						variant="ghost"
					>
						<Heart
							className={`h-4 w-4 ${combo.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
						/>
					</Button>
				)}

				<div className="p-4">
					<div className="mb-3 flex items-center gap-1.5 pb-1">
						{combo.moves
							.slice(0, COMBO_MOVES_DISPLAY_COUNT)
							.map((move, index) => (
								<Tooltip key={move.id}>
									<TooltipTrigger asChild>
										<div
											className="relative flex-shrink-0"
											style={{ zIndex: combo.moves.length - index }}
										>
											<div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
												<img
													alt={move.name}
													className="h-full w-full object-cover"
													src={move.imageUrl || FALLBACK_IMAGE}
												/>
											</div>
											<span className="-bottom-1 -right-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
												{move.orderIndex}
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent side="top">{move.name}</TooltipContent>
								</Tooltip>
							))}
						{combo.moves.length > COMBO_MOVES_DISPLAY_COUNT && (
							<div className="relative flex-shrink-0" style={{ zIndex: 0 }}>
								<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-muted shadow-sm">
									<span className="font-medium text-muted-foreground text-sm">
										+{combo.moves.length - COMBO_MOVES_DISPLAY_COUNT}
									</span>
								</div>
							</div>
						)}
					</div>
				</div>

				<CardContent className="space-y-2 px-4 pt-0 pb-4">
					<h3
						className="mb-0 font-semibold text-base group-hover:text-primary"
						data-testid="combo-card-title"
					>
						{combo.name}
					</h3>

					<div className="flex items-center justify-between">
						<Badge className={LEVEL_COLORS[combo.level]} variant="secondary">
							{getLevelLabel(combo.level)}
						</Badge>
						<span className="text-muted-foreground text-sm">
							{m.combos_moves_count({ count: combo.moves.length.toString() })}
						</span>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}

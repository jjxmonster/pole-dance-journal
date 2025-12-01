import { Link } from "@tanstack/react-router";
import type { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import type { TransitionMoveReferenceSchema } from "@/orpc/schema";
import { m } from "@/paraglide/messages";
import { LEVEL_COLORS } from "@/utils/constants";

type TransitionMoveReference = z.infer<typeof TransitionMoveReferenceSchema>;

type TransitionMovesSectionProps = {
	transitionMoves: TransitionMoveReference[];
	moveId: string;
};

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

function TransitionMoveCard({ move }: { move: TransitionMoveReference }) {
	return (
		<Link
			className="block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
			params={{ slug: move.slug }}
			to="/moves/$slug"
		>
			<div className="aspect-square overflow-hidden bg-muted">
				{move.imageUrl ? (
					<img
						alt={move.name}
						className="h-full w-full object-cover"
						src={move.imageUrl}
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-muted-foreground">
						No image
					</div>
				)}
			</div>
			<div className="space-y-3 p-4">
				<div className="space-y-2">
					<h3 className="font-semibold text-lg leading-tight">{move.name}</h3>
					<Badge className={LEVEL_COLORS[move.level]} variant="secondary">
						{getLevelLabel(move.level)}
					</Badge>
				</div>
				<Button asChild className="w-full" variant="outline">
					<span>{m.transition_move_card_view_button()}</span>
				</Button>
			</div>
		</Link>
	);
}

export function TransitionMovesSection({
	transitionMoves,
	moveId,
}: TransitionMovesSectionProps) {
	if (transitionMoves.length === 0) {
		return null;
	}

	return (
		<section
			aria-labelledby="transition-moves-title"
			className="space-y-4"
			data-testid={`transition-moves-section-${moveId}`}
		>
			<div className="space-y-2">
				<h2 className="font-bold text-2xl" id="transition-moves-title">
					{m.transition_moves_section_title()}
				</h2>
				<p className="text-muted-foreground">
					{m.transition_moves_section_description()}
				</p>
			</div>

			<div className="md:hidden">
				<Carousel
					className="mx-auto w-full max-w-xs"
					opts={{ loop: true, align: "center" }}
				>
					<CarouselContent>
						{transitionMoves.map((move) => (
							<CarouselItem key={move.id}>
								<div className="px-1">
									<TransitionMoveCard move={move} />
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="-left-5" />
					<CarouselNext className="-right-5" />
				</Carousel>
			</div>

			<div className="hidden grid-cols-3 gap-6 md:grid">
				{transitionMoves.map((move) => (
					<TransitionMoveCard key={move.id} move={move} />
				))}
			</div>
		</section>
	);
}

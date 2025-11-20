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
import type { ComboMoveReferenceSchema } from "@/orpc/schema";
import { m } from "@/paraglide/messages";
import { LEVEL_COLORS } from "@/utils/constants";

type ComboMoveReference = z.infer<typeof ComboMoveReferenceSchema>;

type ComboMovesSectionProps = {
	comboMoves: ComboMoveReference[];
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

function ComboMoveCard({ move }: { move: ComboMoveReference }) {
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
					<span>{m.combo_move_card_view_button()}</span>
				</Button>
			</div>
		</Link>
	);
}

export function ComboMovesSection({
	comboMoves,
	moveId,
}: ComboMovesSectionProps) {
	if (comboMoves.length === 0) {
		return null;
	}

	return (
		<section
			aria-labelledby="combo-moves-title"
			className="space-y-4"
			data-testid={`combo-moves-section-${moveId}`}
		>
			<div className="space-y-2">
				<h2 className="font-bold text-2xl" id="combo-moves-title">
					{m.combo_moves_section_title()}
				</h2>
				<p className="text-muted-foreground">
					{m.combo_moves_section_description()}
				</p>
			</div>

			<div className="md:hidden">
				<Carousel
					className="mx-auto w-full max-w-xs"
					opts={{ loop: true, align: "center" }}
				>
					<CarouselContent>
						{comboMoves.map((move) => (
							<CarouselItem key={move.id}>
								<div className="px-1">
									<ComboMoveCard move={move} />
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="-left-5" />
					<CarouselNext className="-right-5" />
				</Carousel>
			</div>

			<div className="hidden grid-cols-3 gap-6 md:grid">
				{comboMoves.map((move) => (
					<ComboMoveCard key={move.id} move={move} />
				))}
			</div>
		</section>
	);
}

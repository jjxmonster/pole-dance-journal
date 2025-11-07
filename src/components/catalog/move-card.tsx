import { Link } from "@tanstack/react-router";
import type { z } from "zod";
import { m } from "@/paraglide/messages";
import { LEVEL_COLORS } from "@/utils/constants";
import type { MoveListItemSchema } from "../../orpc/schema";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

type MoveDTO = z.infer<typeof MoveListItemSchema>;

type MoveCardProps = {
	move: MoveDTO;
};

const getLevelLabel = (level: MoveDTO["level"]): string => {
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

export function MoveCard({ move }: MoveCardProps) {
	const imageUrl = move.imageUrl || FALLBACK_IMAGE;

	return (
		<Link
			className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			data-testid="move-card"
			params={{ slug: move.slug }}
			to="/moves/$slug"
		>
			<Card className="h-full gap-0 py-0 transition-shadow group-hover:shadow-lg">
				<div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl">
					<img
						alt={`${move.name} - pole dance move`}
						className="h-full w-full object-cover transition-transform group-hover:scale-105"
						src={imageUrl}
					/>
				</div>
				<CardContent className="space-y-1 p-3">
					<h3
						className="mb-0 font-semibold text-base group-hover:text-primary"
						data-testid="move-card-title"
					>
						{move.name}
					</h3>

					<Badge className={LEVEL_COLORS[move.level]} variant="secondary">
						{getLevelLabel(move.level)}
					</Badge>
				</CardContent>
			</Card>
		</Link>
	);
}

import { Link } from "@tanstack/react-router";
import type { z } from "zod";
import type { MoveListItemSchema } from "../../orpc/schema";
import { Card, CardContent } from "../ui/card";

type MoveDTO = z.infer<typeof MoveListItemSchema>;

type MoveCardProps = {
	move: MoveDTO;
};

const LEVEL_LABELS: Record<MoveDTO["level"], string> = {
	Beginner: "Początkujący",
	Intermediate: "Średnio zaawansowany",
	Advanced: "Zaawansowany",
};

const FALLBACK_IMAGE = "/move.jpg";

export function MoveCard({ move }: MoveCardProps) {
	const imageUrl = move.imageUrl || FALLBACK_IMAGE;

	return (
		<Link
			className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
					<h3 className="mb-0 font-semibold text-base group-hover:text-primary">
						{move.name}
					</h3>
					<span className="text-muted-foreground text-sm">
						{LEVEL_LABELS[move.level]}
					</span>
				</CardContent>
			</Card>
		</Link>
	);
}

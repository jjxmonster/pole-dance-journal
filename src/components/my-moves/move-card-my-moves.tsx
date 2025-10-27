import { Link } from "@tanstack/react-router";
import { FileTextIcon } from "lucide-react";
import { LEVEL_COLORS } from "@/utils/constants";
import type { MyMoveViewModel } from "../../types/my-moves";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

type MoveCardMyMovesProps = {
	move: MyMoveViewModel;
};

const LEVEL_LABELS: Record<MyMoveViewModel["level"], string> = {
	Beginner: "Początkujący",
	Intermediate: "Średnio zaawansowany",
	Advanced: "Zaawansowany",
};

const FALLBACK_IMAGE = "/move.jpg";

export function MoveCardMyMoves({ move }: MoveCardMyMovesProps) {
	const imageUrl = move.imageUrl || FALLBACK_IMAGE;

	return (
		<Card
			className={`h-full gap-0 py-0 ${move.isArchived ? "opacity-60" : ""}`}
		>
			<div className="relative">
				<Link
					className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					params={{ slug: move.slug }}
					to="/moves/$slug"
				>
					<div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl">
						<img
							alt={`${move.name} - pole dance move`}
							className="h-full w-full object-cover transition-transform group-hover:scale-105"
							src={imageUrl}
						/>
						{move.isArchived && (
							<div className="absolute inset-0 flex items-center justify-center bg-black/50">
								<Badge className="text-xs" variant="secondary">
									Zarchiwizowany
								</Badge>
							</div>
						)}
					</div>
				</Link>
			</div>

			<CardContent className="space-y-3 p-3">
				<div className="flex items-start justify-between gap-2">
					<Link
						className="group flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						params={{ slug: move.slug }}
						to="/moves/$slug"
					>
						<h3 className="mb-0 font-semibold text-base group-hover:text-primary">
							{move.name}
						</h3>
					</Link>
					{move.hasNote && (
						<Link
							aria-label="Posiada notatki"
							className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							params={{ slug: move.slug }}
							to="/moves/$slug"
						>
							<FileTextIcon className="size-4 text-muted-foreground transition-colors hover:text-foreground" />
						</Link>
					)}
				</div>

				<Badge className={LEVEL_COLORS[move.level]} variant="secondary">
					{LEVEL_LABELS[move.level]}
				</Badge>
			</CardContent>
		</Card>
	);
}

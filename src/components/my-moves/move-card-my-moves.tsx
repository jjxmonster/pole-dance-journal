import { Link } from "@tanstack/react-router";
import { FileTextIcon } from "lucide-react";
import { m } from "@/paraglide/messages";
import { LEVEL_COLORS } from "@/utils/constants";
import type { MyMoveViewModel } from "../../types/my-moves";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

type MoveCardMyMovesProps = {
	move: MyMoveViewModel;
};

const getLevelLabel = (level: MyMoveViewModel["level"]): string => {
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

const getStatusLabel = (status: MyMoveViewModel["status"]): string => {
	switch (status) {
		case "WANT":
			return m.my_moves_status_want();
		case "ALMOST":
			return m.my_moves_status_almost();
		case "DONE":
			return m.my_moves_status_done();
		default:
			return status;
	}
};

const FALLBACK_IMAGE = "/move.jpg";

export function MoveCardMyMoves({ move }: MoveCardMyMovesProps) {
	const imageUrl = move.imageUrl || FALLBACK_IMAGE;

	return (
		<Card
			className={`h-full gap-0 py-0 ${move.isArchived ? "opacity-60" : ""}`}
			data-testid={`move-card-${move.id}`}
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
									{m.my_moves_card_archived_badge()}
								</Badge>
							</div>
						)}
					</div>
				</Link>
			</div>

			<CardContent className="space-y-2 p-3">
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
							aria-label={m.my_moves_card_has_note_aria_label()}
							className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							params={{ slug: move.slug }}
							to="/moves/$slug"
						>
							<FileTextIcon className="size-4 text-muted-foreground transition-colors hover:text-foreground" />
						</Link>
					)}
				</div>
				<div className="flex flex-col gap-2">
					<Badge className={LEVEL_COLORS[move.level]} variant="secondary">
						{getLevelLabel(move.level)}
					</Badge>
					<Badge variant="default">
						{move.status === "DONE"
							? m.my_moves_card_status_done_celebration({
									status: getStatusLabel(move.status),
								})
							: m.my_moves_card_status_in_progress({
									status: getStatusLabel(move.status),
								})}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}

import type { MoveLevel } from "../../types/move";
import { Badge } from "../ui/badge";

type LevelFilterBadgesProps = {
	activeLevel: MoveLevel | "All";
	onChange: (level: MoveLevel | "All") => void;
};

const LEVEL_LABELS: Record<MoveLevel | "All", string> = {
	All: "All",
	Beginner: "Beginner",
	Intermediate: "Intermediate",
	Advanced: "Advanced",
};

const LEVELS: Array<MoveLevel | "All"> = [
	"All",
	"Beginner",
	"Intermediate",
	"Advanced",
];

export function LevelFilterBadges({
	activeLevel,
	onChange,
}: LevelFilterBadgesProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			{LEVELS.map((level) => {
				const isActive = activeLevel === level;
				return (
					<button
						aria-label={`Filtruj według poziomu: ${LEVEL_LABELS[level]}`}
						aria-pressed={isActive}
						className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						key={level}
						onClick={() => onChange(level)}
						type="button"
					>
						<Badge
							className={`cursor-pointer rounded-full px-6 py-2 font-medium text-sm transition-all hover:scale-105 ${
								isActive
									? "border-primary bg-primary text-white hover:bg-primary/90"
									: "border-gray-300 bg-transparent text-gray-700"
							}`}
							variant={isActive ? "default" : "outline"}
						>
							{LEVEL_LABELS[level]}
						</Badge>
					</button>
				);
			})}
		</div>
	);
}

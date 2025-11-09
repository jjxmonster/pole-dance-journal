import { m } from "@/paraglide/messages";
import type { MoveLevel } from "../../../types/move";
import { Badge } from "../../ui/badge";

type LevelFilterBadgesProps = {
	activeLevel: MoveLevel | "All";
	onChange: (level: MoveLevel | "All") => void;
};

const LEVELS: Array<MoveLevel | "All"> = [
	"All",
	"Beginner",
	"Intermediate",
	"Advanced",
];

const getLevelLabel = (level: MoveLevel | "All"): string => {
	switch (level) {
		case "All":
			return m.catalog_level_all();
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

export function LevelFilterBadges({
	activeLevel,
	onChange,
}: LevelFilterBadgesProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			{LEVELS.map((level) => {
				const isActive = activeLevel === level;
				const label = getLevelLabel(level);
				return (
					<button
						aria-label={m.catalog_level_filter_aria_label({ level: label })}
						aria-pressed={isActive}
						className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						data-testid="level-filter-badge"
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
							{label}
						</Badge>
					</button>
				);
			})}
		</div>
	);
}

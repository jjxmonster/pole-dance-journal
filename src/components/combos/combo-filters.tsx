import { Check, ChevronsUpDown, Heart, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import type { MoveLevel } from "@/types/move";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type ComboFiltersProps = {
	activeLevel: MoveLevel | "All";
	selectedMoveId: string | undefined;
	moves: Array<{ id: string; name: string; level: MoveLevel }>;
	onLevelChange: (level: MoveLevel | "All") => void;
	onMoveChange: (moveId: string | undefined) => void;
	onResetFilters: () => void;
	onlyFavorites: boolean;
	onFavoritesToggle: () => void;
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

export function ComboFilters({
	activeLevel,
	selectedMoveId,
	moves,
	onLevelChange,
	onMoveChange,
	onResetFilters,
	onlyFavorites,
	onFavoritesToggle,
}: ComboFiltersProps) {
	const [open, setOpen] = useState(false);

	const selectedMove = moves.find((move) => move.id === selectedMoveId);

	return (
		<div className="space-y-4">
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
							onClick={() => onLevelChange(level)}
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

			<div className="flex items-center gap-2">
				<Popover onOpenChange={setOpen} open={open}>
					<PopoverTrigger asChild>
						<Button
							aria-expanded={open}
							className="w-full max-w-xs justify-between"
							role="combobox"
							variant="outline"
						>
							{selectedMove ? selectedMove.name : m.combos_filter_by_move()}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-full max-w-xs p-0">
						<Command>
							<CommandInput placeholder={m.combos_search_move_placeholder()} />
							<CommandList>
								<CommandEmpty>{m.combos_no_moves_found()}</CommandEmpty>
								<CommandGroup>
									{moves.map((move) => (
										<CommandItem
											key={move.id}
											onSelect={() => {
												onMoveChange(
													move.id === selectedMoveId ? undefined : move.id
												);
												setOpen(false);
											}}
											value={move.name}
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													selectedMoveId === move.id
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											{move.name}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				<Button
					aria-label={m.combos_favorites_filter_aria_label()}
					aria-pressed={onlyFavorites}
					className={cn(
						"transition-colors",
						onlyFavorites &&
							"bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
					)}
					onClick={onFavoritesToggle}
					size="default"
					title={m.combos_favorites_filter_tooltip()}
					variant="outline"
				>
					<Heart className={cn("h-4 w-4", onlyFavorites && "fill-current")} />
					{m.combos_favorites_filter_tooltip()}
				</Button>

				{(selectedMoveId || onlyFavorites) && (
					<Button onClick={onResetFilters} size="icon-sm" variant="ghost">
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}

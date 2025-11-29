import { useQuery } from "@tanstack/react-query";
import { Check, GripVertical, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";
import {
	COMBO_MOVES_MAX_COUNT,
	COMBO_MOVES_MIN_COUNT,
} from "@/utils/constants";

type ComboMovesSelectorProps = {
	value: string[];
	onChange: (value: string[]) => void;
	disabled?: boolean;
	error?: string;
};

export function ComboMovesSelector({
	value,
	onChange,
	disabled = false,
	error,
}: ComboMovesSelectorProps) {
	const [_, setOpen] = useState(false);

	const { data: movesData, isLoading } = useQuery({
		queryKey: ["admin", "moves", "all-for-combo"],
		queryFn: () =>
			orpc.admin.moves.listMoves.call({
				limit: 100,
				offset: 0,
				status: "Published",
			}),
	});

	const availableMoves = useMemo(() => {
		if (!movesData) {
			return [];
		}
		return movesData.moves;
	}, [movesData]);

	const selectedMoves = useMemo(
		() =>
			value
				.map((id) => availableMoves.find((move) => move.id === id))
				.filter(Boolean),
		[value, availableMoves]
	);

	const handleSelect = useCallback(
		(moveId: string) => {
			if (value.includes(moveId)) {
				onChange(value.filter((id) => id !== moveId));
			} else if (value.length < COMBO_MOVES_MAX_COUNT) {
				onChange([...value, moveId]);
			}
			setOpen(false);
		},
		[value, onChange]
	);

	const handleRemove = useCallback(
		(moveId: string) => {
			onChange(value.filter((id) => id !== moveId));
		},
		[value, onChange]
	);

	const handleMoveUp = useCallback(
		(index: number) => {
			if (index === 0) {
				return;
			}
			const newValue = [...value];
			[newValue[index - 1], newValue[index]] = [
				newValue[index],
				newValue[index - 1],
			];
			onChange(newValue);
		},
		[value, onChange]
	);

	const handleMoveDown = useCallback(
		(index: number) => {
			if (index === value.length - 1) {
				return;
			}
			const newValue = [...value];
			[newValue[index], newValue[index + 1]] = [
				newValue[index + 1],
				newValue[index],
			];
			onChange(newValue);
		},
		[value, onChange]
	);

	return (
		<div>
			<Label className="mb-2 block font-medium text-sm">
				Moves in Combo <span className="text-destructive">*</span>
			</Label>
			<p className="mb-3 text-muted-foreground text-sm">
				Select {COMBO_MOVES_MIN_COUNT} to {COMBO_MOVES_MAX_COUNT} moves for this
				combo. The order determines the sequence of moves.
			</p>

			<div className="space-y-3">
				{selectedMoves.length > 0 && (
					<div className="space-y-2">
						{selectedMoves.map((move, index) => {
							if (!move) {
								return null;
							}
							return (
								<div
									className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-2"
									key={move.id}
								>
									<div className="flex flex-col gap-0.5">
										<Button
											className="h-4 w-4 p-0"
											disabled={disabled || index === 0}
											onClick={() => handleMoveUp(index)}
											size="sm"
											type="button"
											variant="ghost"
										>
											<GripVertical className="h-3 w-3 rotate-90" />
										</Button>
										<Button
											className="h-4 w-4 p-0"
											disabled={disabled || index === selectedMoves.length - 1}
											onClick={() => handleMoveDown(index)}
											size="sm"
											type="button"
											variant="ghost"
										>
											<GripVertical className="-rotate-90 h-3 w-3" />
										</Button>
									</div>
									<Badge className="shrink-0" variant="secondary">
										{index + 1}
									</Badge>
									<span className="flex-1 text-sm">{move.name}</span>
									<Badge variant="outline">{move.level}</Badge>
									<Button
										disabled={disabled}
										onClick={() => handleRemove(move.id)}
										size="sm"
										type="button"
										variant="ghost"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							);
						})}
					</div>
				)}

				{value.length < COMBO_MOVES_MAX_COUNT && (
					<Command className="border">
						<CommandInput
							disabled={disabled || isLoading}
							placeholder="Search published moves..."
						/>
						<CommandList>
							{isLoading && (
								<CommandEmpty>Loading available moves...</CommandEmpty>
							)}
							{!isLoading && availableMoves.length === 0 && (
								<CommandEmpty>No published moves found.</CommandEmpty>
							)}
							{!isLoading && availableMoves.length > 0 && (
								<>
									<CommandEmpty>No moves found.</CommandEmpty>
									<CommandGroup>
										{availableMoves.map((move) => {
											const isSelected = value.includes(move.id);
											return (
												<CommandItem
													key={move.id}
													onSelect={() => handleSelect(move.id)}
													value={move.name}
												>
													<div
														className={cn(
															"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
															isSelected
																? "bg-primary text-primary-foreground"
																: "opacity-50 [&_svg]:invisible"
														)}
													>
														<Check className="h-4 w-4" />
													</div>
													<div className="flex flex-1 items-center gap-2">
														<span>{move.name}</span>
														<Badge variant="outline">{move.level}</Badge>
													</div>
												</CommandItem>
											);
										})}
									</CommandGroup>
								</>
							)}
						</CommandList>
					</Command>
				)}

				{value.length >= COMBO_MOVES_MAX_COUNT && (
					<p className="text-muted-foreground text-sm">
						Maximum of {COMBO_MOVES_MAX_COUNT} moves reached. Remove one to add
						another.
					</p>
				)}

				{error && <p className="text-destructive text-sm">{error}</p>}

				<p className="text-muted-foreground text-xs">
					{value.length}/{COMBO_MOVES_MAX_COUNT} moves selected (minimum{" "}
					{COMBO_MOVES_MIN_COUNT})
				</p>
			</div>
		</div>
	);
}

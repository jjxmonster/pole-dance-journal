import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
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
import { MAX_COMBO_REFERENCES_COUNT } from "@/utils/constants";

type ComboReferencesSelectorProps = {
	value: string[];
	onChange: (value: string[]) => void;
	currentMoveId: string;
	disabled?: boolean;
};

export function ComboReferencesSelector({
	value,
	onChange,
	currentMoveId,
	disabled = false,
}: ComboReferencesSelectorProps) {
	const [_, setOpen] = useState(false);

	const { data: movesData, isLoading } = useQuery({
		queryKey: ["admin", "moves", "all"],
		queryFn: () =>
			orpc.admin.moves.listMoves.call({
				limit: 100,
				offset: 0,
			}),
	});

	const availableMoves = useMemo(() => {
		if (!movesData) {
			return [];
		}
		return movesData.moves.filter((move) => move.id !== currentMoveId);
	}, [movesData, currentMoveId]);

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
			} else if (value.length < MAX_COMBO_REFERENCES_COUNT) {
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

	return (
		<div>
			<Label className="mb-2 block font-medium text-sm">
				Combo References (Optional)
			</Label>
			<p className="mb-3 text-muted-foreground text-sm">
				Select up to 3 moves that are prerequisites or part of this combo. The
				order matters.
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
									<Badge className="shrink-0" variant="secondary">
										{index + 1}
									</Badge>
									<span className="flex-1 text-sm">{move.name}</span>
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

				{value.length < MAX_COMBO_REFERENCES_COUNT && (
					<Command className="border">
						<CommandInput
							disabled={disabled || isLoading}
							placeholder="Search moves..."
						/>
						<CommandList>
							{isLoading && (
								<CommandEmpty>Loading available moves...</CommandEmpty>
							)}
							{!isLoading && availableMoves.length === 0 && (
								<CommandEmpty>No moves found.</CommandEmpty>
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

				{value.length >= MAX_COMBO_REFERENCES_COUNT && (
					<p className="text-muted-foreground text-sm">
						Maximum of 3 combo references reached. Remove one to add another.
					</p>
				)}
			</div>
		</div>
	);
}

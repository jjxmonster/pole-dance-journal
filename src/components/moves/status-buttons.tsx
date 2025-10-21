import type { MoveStatus } from "@/types/move";
import { STATUS_OPTIONS } from "@/utils/constants";
import { Button } from "../ui/button";

type StatusButtonsProps = {
	value: MoveStatus | null;
	onChange: (status: MoveStatus) => void;
	disabled?: boolean;
};

export function StatusButtons({
	value,
	onChange,
	disabled,
}: StatusButtonsProps) {
	return (
		<div className="flex w-full flex-col gap-2">
			<h2 className="font-medium text-lg">Mój Status</h2>
			<div className="flex flex-col gap-2">
				{STATUS_OPTIONS.map((option) => {
					const isSelected = option.value === value;
					const buttonVariant: "default" | "outline" | "secondary" = isSelected
						? "default"
						: "outline";

					return (
						<Button
							className="w-full justify-center"
							disabled={disabled}
							key={option.value}
							onClick={() => onChange(option.value)}
							variant={buttonVariant}
						>
							{option.label}
						</Button>
					);
				})}
			</div>
		</div>
	);
}

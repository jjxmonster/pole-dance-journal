import type { MoveStatus } from "@/types/move";
import { STATUS_OPTIONS } from "@/utils/constants";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

type StatusDropdownProps = {
	value: MoveStatus | null;
	onChange: (status: MoveStatus) => void;
	disabled?: boolean;
};

export function StatusDropdown({
	value,
	onChange,
	disabled,
}: StatusDropdownProps) {
	const selectedOption = STATUS_OPTIONS.find(
		(option) => option.value === value
	);

	return (
		<Select
			disabled={disabled}
			onValueChange={(newValue) => onChange(newValue as MoveStatus)}
			value={value ?? undefined}
		>
			<SelectTrigger className="w-fit">
				<SelectValue placeholder="Wybierz status">
					{selectedOption?.label ?? "Wybierz status"}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{STATUS_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

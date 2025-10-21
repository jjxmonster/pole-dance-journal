import type { MoveStatus } from "../../types/my-moves";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

type StatusDropdownProps = {
	currentStatus: MoveStatus;
	onStatusChange: (newStatus: MoveStatus) => void;
};

const statusOptions: Array<{ value: MoveStatus; label: string }> = [
	{ value: "WANT", label: "Chcę zrobić" },
	{ value: "ALMOST", label: "Prawie" },
	{ value: "DONE", label: "Zrobione" },
];

export function StatusDropdown({
	currentStatus,
	onStatusChange,
}: StatusDropdownProps) {
	return (
		<Select onValueChange={onStatusChange} value={currentStatus}>
			<SelectTrigger>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{statusOptions.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

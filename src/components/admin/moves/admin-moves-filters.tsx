import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { AdminMoveStatus, MoveLevel } from "@/types/admin";

type AdminMovesFiltersProps = {
	query: string;
	level: MoveLevel | "All";
	status: AdminMoveStatus | "All";
	onQueryChange: (query: string) => void;
	onLevelChange: (level: MoveLevel | "All") => void;
	onStatusChange: (status: AdminMoveStatus | "All") => void;
};

export function AdminMovesFilters({
	query,
	level,
	status,
	onQueryChange,
	onLevelChange,
	onStatusChange,
}: AdminMovesFiltersProps) {
	return (
		<div className="mb-6 space-y-4">
			<div className="grid gap-4 md:grid-cols-3">
				<Input
					className="md:col-span-2"
					onChange={(e) => {
						onQueryChange(e.target.value);
					}}
					placeholder="Search moves by name or description..."
					type="text"
					value={query}
				/>
				<Select
					onValueChange={(value) => onLevelChange(value as MoveLevel | "All")}
					value={level}
				>
					<SelectTrigger>
						<SelectValue placeholder="Filter by level" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="All">All Levels</SelectItem>
						<SelectItem value="Beginner">Beginner</SelectItem>
						<SelectItem value="Intermediate">Intermediate</SelectItem>
						<SelectItem value="Advanced">Advanced</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<Select
				onValueChange={(value) => {
					onStatusChange(value as AdminMoveStatus | "All");
				}}
				value={status}
			>
				<SelectTrigger className="w-full md:w-[200px]">
					<SelectValue placeholder="Filter by status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="All">All Status</SelectItem>
					<SelectItem value="Published">Published</SelectItem>
					<SelectItem value="Unpublished">Unpublished</SelectItem>
					<SelectItem value="Deleted">Deleted</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}

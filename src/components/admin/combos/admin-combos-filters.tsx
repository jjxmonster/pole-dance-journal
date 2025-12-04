import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { AdminComboStatus, MoveLevel } from "@/types/admin";

type AdminCombosFiltersProps = {
	query: string;
	level: MoveLevel | "All";
	status: AdminComboStatus | "All";
	onQueryChange: (query: string) => void;
	onLevelChange: (level: MoveLevel | "All") => void;
	onStatusChange: (status: AdminComboStatus | "All") => void;
};

export function AdminCombosFilters({
	query,
	level,
	status,
	onQueryChange,
	onLevelChange,
	onStatusChange,
}: AdminCombosFiltersProps) {
	return (
		<div className="mb-6 flex flex-wrap items-center gap-4">
			<div className="relative flex-1">
				<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
				<Input
					className="pl-9"
					onChange={(e) => onQueryChange(e.target.value)}
					placeholder="Search combos..."
					value={query}
				/>
				{query && (
					<Button
						className="-translate-y-1/2 absolute top-1/2 right-1 h-7 w-7"
						onClick={() => onQueryChange("")}
						size="icon-sm"
						variant="ghost"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>

			<Select
				onValueChange={(value) => onLevelChange(value as MoveLevel | "All")}
				value={level}
			>
				<SelectTrigger className="w-40">
					<SelectValue placeholder="Level" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="All">All Levels</SelectItem>
					<SelectItem value="Beginner">Beginner</SelectItem>
					<SelectItem value="Intermediate">Intermediate</SelectItem>
					<SelectItem value="Advanced">Advanced</SelectItem>
				</SelectContent>
			</Select>

			<Select
				onValueChange={(value) =>
					onStatusChange(value as AdminComboStatus | "All")
				}
				value={status}
			>
				<SelectTrigger className="w-40">
					<SelectValue placeholder="Status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="All">All Statuses</SelectItem>
					<SelectItem value="Published">Published</SelectItem>
					<SelectItem value="Unpublished">Draft</SelectItem>
					<SelectItem value="Deleted">Deleted</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}

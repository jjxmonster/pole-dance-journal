import { m } from "@/paraglide/messages";
import type { MoveStatus } from "@/types/move";
import { Badge } from "../ui/badge";

type StatusFilterBadgesProps = {
	activeStatus: MoveStatus | "All";
	onChange: (status: MoveStatus | "All") => void;
};

const STATUSES: Array<MoveStatus | "All"> = ["All", "WANT", "ALMOST", "DONE"];

const getStatusLabel = (status: MoveStatus | "All"): string => {
	switch (status) {
		case "All":
			return m.my_moves_status_all();
		case "WANT":
			return m.my_moves_status_want();
		case "ALMOST":
			return m.my_moves_status_almost();
		case "DONE":
			return m.my_moves_status_done();
		default:
			return status;
	}
};

export function StatusFilterBadges({
	activeStatus,
	onChange,
}: StatusFilterBadgesProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			{STATUSES.map((status) => {
				const isActive = activeStatus === status;
				const label = getStatusLabel(status);
				return (
					<button
						aria-label={m.my_moves_status_filter_aria_label({ status: label })}
						aria-pressed={isActive}
						className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						data-testid="status-filter-badge"
						key={status}
						onClick={() => onChange(status)}
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

import { useNavigate, useSearch } from "@tanstack/react-router";
import type { MoveLevel, MoveStatus } from "../types/move";

export type MyMovesFilters = {
	level: MoveLevel | "All";
	status: MoveStatus | "All";
};

export function useMyMovesFilters() {
	const navigate = useNavigate({ from: "/my-moves" });
	const searchParams = useSearch({ from: "/my-moves" });

	const level: MoveLevel | "All" = (searchParams.level as MoveLevel) || "All";
	const status: MoveStatus | "All" =
		(searchParams.status as MoveStatus) || "All";

	const filters: MyMovesFilters = { level, status };

	const updateFilters = (updates: Partial<MyMovesFilters>) => {
		navigate({
			search: (prev) => ({
				...prev,
				level: updates.level === "All" ? undefined : updates.level,
				status: updates.status === "All" ? undefined : updates.status,
			}),
		});
	};

	return { filters, updateFilters };
}

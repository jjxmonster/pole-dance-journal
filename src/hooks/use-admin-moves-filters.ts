import { useCallback, useState } from "react";
import type { AdminMoveStatus, MoveLevel } from "@/types/admin";

const DEFAULT_ADMIN_MOVES_LIMIT = 20;

type AdminMovesFilterState = {
	query: string;
	level: MoveLevel | "All";
	status: AdminMoveStatus | "All";
	page: number;
	limit: number;
};

type AdminMovesFilterActions = {
	setQuery: (query: string) => void;
	setLevel: (level: MoveLevel | "All") => void;
	setStatus: (status: AdminMoveStatus | "All") => void;
	setPage: (page: number) => void;
};

export function useAdminMovesFilters(
	onFiltersChange?: (filters: AdminMovesFilterState) => void
): AdminMovesFilterState & AdminMovesFilterActions {
	const [query, setQueryState] = useState<string>("");
	const [level, setLevelState] = useState<MoveLevel | "All">("All");
	const [status, setStatusState] = useState<AdminMoveStatus | "All">("All");
	const [page, setPageState] = useState<number>(1);
	const limit = DEFAULT_ADMIN_MOVES_LIMIT;

	const setQuery = useCallback(
		(newQuery: string) => {
			setQueryState(newQuery);
			const newFilters = { query: newQuery, level, status, page: 1, limit };
			onFiltersChange?.(newFilters);
			setPageState(1);
		},
		[level, status, limit, onFiltersChange]
	);

	const setLevel = useCallback(
		(newLevel: MoveLevel | "All") => {
			setLevelState(newLevel);
			const newFilters = { query, level: newLevel, status, page: 1, limit };
			onFiltersChange?.(newFilters);
			setPageState(1);
		},
		[query, status, limit, onFiltersChange]
	);

	const setStatus = useCallback(
		(newStatus: AdminMoveStatus | "All") => {
			setStatusState(newStatus);
			const newFilters = { query, level, status: newStatus, page: 1, limit };
			onFiltersChange?.(newFilters);
			setPageState(1);
		},
		[query, level, limit, onFiltersChange]
	);

	const setPage = useCallback(
		(newPage: number) => {
			setPageState(newPage);
			const newFilters = { query, level, status, page: newPage, limit };
			onFiltersChange?.(newFilters);
		},
		[query, level, status, limit, onFiltersChange]
	);

	return {
		query,
		level,
		status,
		page,
		limit,
		setQuery,
		setLevel,
		setStatus,
		setPage,
	};
}

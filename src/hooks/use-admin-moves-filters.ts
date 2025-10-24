import { useSearch } from "@tanstack/react-router";
import { useCallback } from "react";
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
	const searchParams = useSearch({
		from: "/admin/moves",
	}) as Partial<AdminMovesFilterState>;

	const query = searchParams.query ?? "";
	const level = (searchParams.level ?? "All") as MoveLevel | "All";
	const status = (searchParams.status ?? "All") as AdminMoveStatus | "All";
	const page = searchParams.page ?? 1;
	const limit = searchParams.limit ?? DEFAULT_ADMIN_MOVES_LIMIT;

	const setQuery = useCallback(
		(newQuery: string) => {
			const newFilters = { query: newQuery, level, status, page: 1, limit };
			onFiltersChange?.(newFilters);
		},
		[level, status, limit, onFiltersChange]
	);

	const setLevel = useCallback(
		(newLevel: MoveLevel | "All") => {
			const newFilters = { query, level: newLevel, status, page: 1, limit };
			onFiltersChange?.(newFilters);
		},
		[query, status, limit, onFiltersChange]
	);

	const setStatus = useCallback(
		(newStatus: AdminMoveStatus | "All") => {
			const newFilters = { query, level, status: newStatus, page: 1, limit };
			onFiltersChange?.(newFilters);
		},
		[query, level, limit, onFiltersChange]
	);

	const setPage = useCallback(
		(newPage: number) => {
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

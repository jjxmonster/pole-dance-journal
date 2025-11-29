import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import type { AdminComboStatus, MoveLevel } from "@/types/admin";

const DEFAULT_LIMIT = 20;

export function useAdminCombosFilters() {
	const navigate = useNavigate({ from: "/admin/combos" });
	const searchParams = useSearch({ from: "/admin/combos/" });

	const [query, setQueryState] = useState(searchParams.query ?? "");
	const [level, setLevelState] = useState<MoveLevel | "All">(
		searchParams.level ?? "All"
	);
	const [status, setStatusState] = useState<AdminComboStatus | "All">(
		searchParams.status ?? "All"
	);
	const [page, setPageState] = useState(searchParams.page ?? 1);

	const updateUrl = (params: {
		query?: string;
		level?: MoveLevel | "All";
		status?: AdminComboStatus | "All";
		page?: number;
	}) => {
		const newLevel = params.level ?? level;
		const newStatus = params.status ?? status;

		navigate({
			search: {
				query:
					params.query !== undefined
						? params.query || undefined
						: query || undefined,
				level: newLevel === "All" ? undefined : newLevel,
				status: newStatus === "All" ? undefined : newStatus,
				page: params.page ?? page,
			},
		});
	};

	const setQuery = (newQuery: string) => {
		setQueryState(newQuery);
		setPageState(1);
		updateUrl({ query: newQuery || undefined, page: 1 });
	};

	const setLevel = (newLevel: MoveLevel | "All") => {
		setLevelState(newLevel);
		setPageState(1);
		updateUrl({ level: newLevel, page: 1 });
	};

	const setStatus = (newStatus: AdminComboStatus | "All") => {
		setStatusState(newStatus);
		setPageState(1);
		updateUrl({ status: newStatus, page: 1 });
	};

	const setPage = (newPage: number) => {
		setPageState(newPage);
		updateUrl({ page: newPage });
	};

	return {
		query,
		level,
		status,
		page,
		limit: DEFAULT_LIMIT,
		setQuery,
		setLevel,
		setStatus,
		setPage,
	};
}

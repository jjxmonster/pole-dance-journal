import { useNavigate, useSearch } from "@tanstack/react-router";
import type { moveLevelEnum } from "../db/schema";

type MoveLevel = (typeof moveLevelEnum.enumValues)[number];

type CatalogFilters = {
	query: string;
	level: MoveLevel | "All";
	page: number;
};

export function useCatalogFilters() {
	const navigate = useNavigate({ from: "/catalog" });
	const searchParams = useSearch({ from: "/catalog" });

	const filters: CatalogFilters = {
		query: searchParams.query || "",
		level: searchParams.level || "All",
		page: searchParams.page || 1,
	};

	const updateFilters = (updates: Partial<CatalogFilters>) => {
		const newLevel =
			updates.level === "All" ? undefined : updates.level || searchParams.level;

		navigate({
			search: {
				query: updates.query !== undefined ? updates.query : searchParams.query,
				level: newLevel,
				page: updates.page !== undefined ? updates.page : 1,
			},
		});
	};

	const resetFilters = () => {
		navigate({
			search: {},
		});
	};

	return { filters, updateFilters, resetFilters };
}

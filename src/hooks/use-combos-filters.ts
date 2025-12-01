import { useNavigate, useSearch } from "@tanstack/react-router";
import type { moveLevelEnum } from "../db/schema";

type MoveLevel = (typeof moveLevelEnum.enumValues)[number];

type CombosFilters = {
	level: MoveLevel | "All";
	moveId: string | undefined;
	page: number;
	onlyFavorites: boolean;
};

export function useCombosFilters() {
	const navigate = useNavigate({ from: "/combos/" });
	const searchParams = useSearch({ from: "/combos/" });

	const filters: CombosFilters = {
		level: (searchParams.level as MoveLevel | "All") || "All",
		moveId: searchParams.moveId,
		page: searchParams.page || 1,
		onlyFavorites: searchParams.onlyFavorites ?? false,
	};

	const updateFilters = (updates: Partial<CombosFilters>) => {
		const newLevel =
			updates.level === "All" ? undefined : updates.level || searchParams.level;

		const newOnlyFavorites =
			updates.onlyFavorites !== undefined
				? updates.onlyFavorites || undefined
				: searchParams.onlyFavorites || undefined;

		navigate({
			search: {
				level: newLevel,
				moveId:
					updates.moveId !== undefined ? updates.moveId : searchParams.moveId,
				page: updates.page !== undefined ? updates.page : 1,
				onlyFavorites: newOnlyFavorites,
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

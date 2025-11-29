import { useNavigate, useSearch } from "@tanstack/react-router";
import type { moveLevelEnum } from "../db/schema";

type MoveLevel = (typeof moveLevelEnum.enumValues)[number];

type CombosFilters = {
	level: MoveLevel | "All";
	moveId: string | undefined;
	page: number;
};

export function useCombosFilters() {
	const navigate = useNavigate({ from: "/combos" });
	const searchParams = useSearch({ from: "/combos" });

	const filters: CombosFilters = {
		level: searchParams.level || "All",
		moveId: searchParams.moveId,
		page: searchParams.page || 1,
	};

	const updateFilters = (updates: Partial<CombosFilters>) => {
		const newLevel =
			updates.level === "All" ? undefined : updates.level || searchParams.level;

		navigate({
			search: {
				level: newLevel,
				moveId:
					updates.moveId !== undefined ? updates.moveId : searchParams.moveId,
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

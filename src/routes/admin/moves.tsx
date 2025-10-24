import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminMovesFilters } from "@/components/admin/moves/admin-moves-filters";
import { AdminMovesHeader } from "@/components/admin/moves/admin-moves-header";
import { AdminMovesPagination } from "@/components/admin/moves/admin-moves-pagination";
import { AdminMovesTable } from "@/components/admin/moves/admin-moves-table";
import { useAdminMovesFilters } from "@/hooks/use-admin-moves-filters";
import { adminMovesQueryOptions } from "@/query-options/admin";
import type { AdminMoveStatus, MoveLevel } from "@/types/admin";

export const Route = createFileRoute("/admin/moves")({
	component: AdminMovesView,
	head: () => ({
		meta: [
			{
				title: "Manage Moves - Admin Dashboard",
			},
			{
				name: "description",
				content: "Manage all pole dance moves in the catalog.",
			},
		],
	}),
});

function AdminMovesView() {
	return <AdminMovesPage />;
}

function AdminMovesPage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const {
		query,
		level,
		status,
		page,
		limit,
		setQuery,
		setLevel,
		setStatus,
		setPage,
	} = useAdminMovesFilters((filters) => {
		setIsLoading(true);
		const searchParams = new URLSearchParams();
		if (filters.query) {
			searchParams.set("query", filters.query);
		}
		if (filters.level !== "All") {
			searchParams.set("level", filters.level);
		}
		if (filters.status !== "All") {
			searchParams.set("status", filters.status);
		}
		if (filters.page !== 1) {
			searchParams.set("page", filters.page.toString());
		}

		navigate({
			to: "/admin/moves",
			search: Object.fromEntries(searchParams),
		});
	});

	const offset = (page - 1) * limit;
	const queryInput = {
		limit,
		offset,
		...(level !== "All" && { level: level as MoveLevel }),
		...(status !== "All" && { status: status as AdminMoveStatus }),
		...(query && { query }),
	};

	const { data, isError } = useSuspenseQuery(
		adminMovesQueryOptions(queryInput)
	);

	const totalPages = Math.ceil(data.total / limit);

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<AdminMovesHeader />
			<AdminMovesFilters
				level={level}
				onLevelChange={setLevel}
				onQueryChange={setQuery}
				onStatusChange={setStatus}
				query={query}
				status={status}
			/>
			<AdminMovesTable
				isError={isError}
				isLoading={isLoading}
				moves={data.moves}
			/>
			<AdminMovesPagination
				currentPage={page}
				onPageChange={setPage}
				totalPages={totalPages}
			/>
		</div>
	);
}

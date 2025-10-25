import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AdminMovesFilters } from "@/components/admin/moves/admin-moves-filters";
import { AdminMovesHeader } from "@/components/admin/moves/admin-moves-header";
import { AdminMovesPagination } from "@/components/admin/moves/admin-moves-pagination";
import { AdminMovesTable } from "@/components/admin/moves/admin-moves-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAdminMovesFilters } from "@/hooks/use-admin-moves-filters";
import { adminMovesQueryOptions } from "@/query-options/admin";
import type { AdminMoveStatus, MoveLevel } from "@/types/admin";

export const Route = createFileRoute("/admin/moves/")({
	component: AdminMovesPage,
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

function AdminMovesPage() {
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
	} = useAdminMovesFilters();

	const offset = (page - 1) * limit;
	const queryInput = {
		limit,
		offset,
		...(level !== "All" && { level: level as MoveLevel }),
		...(status !== "All" && { status: status as AdminMoveStatus }),
		...(query && { query }),
	};

	const { data, isError, isLoading } = useQuery(
		adminMovesQueryOptions(queryInput)
	);

	const totalPages = Math.ceil(data?.total ?? 0 / limit);

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
			{isLoading && (
				<div className="mb-6 rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Level</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Updated</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map(() => (
								<TableRow key={crypto.randomUUID()}>
									<TableCell>
										<Skeleton className="h-5 w-32" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
			{data && <AdminMovesTable isError={isError} moves={data.moves} />}
			<AdminMovesPagination
				currentPage={page}
				onPageChange={setPage}
				totalPages={totalPages}
			/>
		</div>
	);
}

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AdminCombosFilters } from "@/components/admin/combos/admin-combos-filters";
import { AdminCombosHeader } from "@/components/admin/combos/admin-combos-header";
import { AdminCombosPagination } from "@/components/admin/combos/admin-combos-pagination";
import { AdminCombosTable } from "@/components/admin/combos/admin-combos-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAdminCombosFilters } from "@/hooks/use-admin-combos-filters";
import { orpc } from "@/orpc/client";
import type { AdminComboStatus, MoveLevel } from "@/types/admin";

const adminCombosSearchSchema = z.object({
	query: z.string().optional(),
	level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
	status: z.enum(["Published", "Unpublished", "Deleted"]).optional(),
	page: z.number().int().min(1).optional().default(1),
});

export const Route = createFileRoute("/admin/combos/")({
	validateSearch: adminCombosSearchSchema,
	component: AdminCombosPage,
	head: () => ({
		meta: [
			{
				title: "Manage Combos - Admin Dashboard",
			},
			{
				name: "description",
				content: "Manage all pole dance combos in the catalog.",
			},
		],
	}),
});

function AdminCombosPage() {
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
	} = useAdminCombosFilters();

	const offset = (page - 1) * limit;
	const queryInput = {
		limit,
		offset,
		...(level !== "All" && { level: level as MoveLevel }),
		...(status !== "All" && { status: status as AdminComboStatus }),
		...(query && { query }),
	};

	const { data, isError, isLoading } = useQuery({
		queryKey: ["admin", "combos", queryInput],
		queryFn: () => orpc.admin.combos.listCombos.call(queryInput),
	});

	const totalPages = Math.ceil((data?.total ?? 0) / limit);

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<AdminCombosHeader />
			<AdminCombosFilters
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
								<TableHead>Moves</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Updated</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map((_, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
								<TableRow key={index}>
									<TableCell>
										<Skeleton className="h-5 w-32" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-16" />
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
			{data && <AdminCombosTable combos={data.combos} isError={isError} />}
			<AdminCombosPagination
				currentPage={page}
				onPageChange={setPage}
				totalPages={totalPages}
			/>
		</div>
	);
}

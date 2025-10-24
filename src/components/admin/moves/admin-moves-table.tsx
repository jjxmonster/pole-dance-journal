import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { AdminMoveViewModel } from "@/types/admin";
import { AdminMoveTableRow } from "./admin-move-table-row";

type AdminMovesTableProps = {
	moves: AdminMoveViewModel[];
	isLoading: boolean;
	isError: boolean;
};

export function AdminMovesTable({
	moves,
	isLoading,
	isError,
}: AdminMovesTableProps) {
	if (isLoading) {
		return (
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
		);
	}

	if (isError) {
		return (
			<div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-6">
				<p className="text-center text-destructive">
					Failed to load moves. Please refresh the page and try again.
				</p>
			</div>
		);
	}

	if (moves.length === 0) {
		return (
			<div className="mb-6 rounded-lg border border-dashed bg-muted/30 p-12 text-center">
				<p className="text-muted-foreground">
					No moves found. Try adjusting your filters or create a new move.
				</p>
			</div>
		);
	}

	return (
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
					{moves.map((move) => (
						<AdminMoveTableRow key={move.id} move={move} />
					))}
				</TableBody>
			</Table>
		</div>
	);
}

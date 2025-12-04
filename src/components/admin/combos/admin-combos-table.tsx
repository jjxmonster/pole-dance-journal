import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	Archive,
	Edit,
	Eye,
	EyeOff,
	MoreHorizontal,
	RotateCcw,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { orpc } from "@/orpc/client";
import type { AdminComboItem } from "@/orpc/schema";
import { LEVEL_COLORS } from "@/utils/constants";

type AdminCombosTableProps = {
	combos: AdminComboItem[];
	isError: boolean;
};

const getStatusBadge = (status: AdminComboItem["status"]) => {
	switch (status) {
		case "Published":
			return (
				<Badge className="bg-green-100 text-green-800" variant="secondary">
					Published
				</Badge>
			);
		case "Unpublished":
			return (
				<Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
					Draft
				</Badge>
			);
		case "Deleted":
			return (
				<Badge className="bg-red-100 text-red-800" variant="secondary">
					Deleted
				</Badge>
			);
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
};

export function AdminCombosTable({ combos, isError }: AdminCombosTableProps) {
	const queryClient = useQueryClient();

	const publishMutation = useMutation({
		mutationFn: (id: string) => orpc.admin.combos.publishCombo.call({ id }),
		onSuccess: () => {
			toast.success("Combo published successfully");
			queryClient.invalidateQueries({ queryKey: ["admin", "combos"] });
		},
		onError: () => {
			toast.error("Failed to publish combo");
		},
	});

	const unpublishMutation = useMutation({
		mutationFn: (id: string) => orpc.admin.combos.unpublishCombo.call({ id }),
		onSuccess: () => {
			toast.success("Combo unpublished successfully");
			queryClient.invalidateQueries({ queryKey: ["admin", "combos"] });
		},
		onError: () => {
			toast.error("Failed to unpublish combo");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => orpc.admin.combos.deleteCombo.call({ id }),
		onSuccess: () => {
			toast.success("Combo deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["admin", "combos"] });
		},
		onError: () => {
			toast.error("Failed to delete combo");
		},
	});

	const restoreMutation = useMutation({
		mutationFn: (id: string) => orpc.admin.combos.restoreCombo.call({ id }),
		onSuccess: () => {
			toast.success("Combo restored successfully");
			queryClient.invalidateQueries({ queryKey: ["admin", "combos"] });
		},
		onError: () => {
			toast.error("Failed to restore combo");
		},
	});

	if (isError) {
		return (
			<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
				<p className="text-center text-destructive">
					Failed to load combos. Please refresh the page.
				</p>
			</div>
		);
	}

	if (combos.length === 0) {
		return (
			<div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
				<p className="text-muted-foreground">No combos found.</p>
				<Button asChild className="mt-4" variant="outline">
					<Link to="/admin/combos/new">Create your first combo</Link>
				</Button>
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
						<TableHead>Moves</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Updated</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{combos.map((combo) => (
						<TableRow key={combo.id}>
							<TableCell className="font-medium">{combo.name}</TableCell>
							<TableCell>
								<Badge
									className={LEVEL_COLORS[combo.level]}
									variant="secondary"
								>
									{combo.level}
								</Badge>
							</TableCell>
							<TableCell>{combo.movesCount} moves</TableCell>
							<TableCell>{getStatusBadge(combo.status)}</TableCell>
							<TableCell>
								{new Date(combo.updatedAt).toLocaleDateString()}
							</TableCell>
							<TableCell className="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button size="icon-sm" variant="ghost">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										{combo.status !== "Deleted" && (
											<>
												<DropdownMenuItem asChild>
													<Link
														params={{ comboId: combo.id }}
														to="/admin/combos/$comboId"
													>
														<Edit className="mr-2 h-4 w-4" />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												{combo.status === "Published" ? (
													<DropdownMenuItem
														onClick={() => unpublishMutation.mutate(combo.id)}
													>
														<EyeOff className="mr-2 h-4 w-4" />
														Unpublish
													</DropdownMenuItem>
												) : (
													<DropdownMenuItem
														onClick={() => publishMutation.mutate(combo.id)}
													>
														<Eye className="mr-2 h-4 w-4" />
														Publish
													</DropdownMenuItem>
												)}
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => deleteMutation.mutate(combo.id)}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</>
										)}
										{combo.status === "Deleted" && (
											<>
												<DropdownMenuItem
													onClick={() => restoreMutation.mutate(combo.id)}
												>
													<RotateCcw className="mr-2 h-4 w-4" />
													Restore
												</DropdownMenuItem>
												<DropdownMenuItem className="text-destructive" disabled>
													<Archive className="mr-2 h-4 w-4" />
													Permanently Delete
												</DropdownMenuItem>
											</>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

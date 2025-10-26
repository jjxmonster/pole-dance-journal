import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
	useDeleteMoveMutation,
	usePublishMoveMutation,
	useRestoreMoveMutation,
	useUnpublishMoveMutation,
} from "@/hooks/use-admin-move-mutations";
import type { AdminMoveViewModel } from "@/types/admin";

type AdminMoveTableRowProps = {
	move: AdminMoveViewModel;
};

const LEVEL_COLORS = {
	Beginner: "bg-green-100 text-green-800 hover:bg-green-100",
	Intermediate: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
	Advanced: "bg-red-100 text-red-800 hover:bg-red-100",
} as const;

const STATUS_COLORS = {
	Published: "bg-blue-100 text-blue-800 hover:bg-blue-100",
	Unpublished: "bg-gray-100 text-gray-800 hover:bg-gray-100",
	Deleted: "bg-red-100 text-red-800 hover:bg-red-100",
} as const;

type ActionButtonsProps = {
	move: AdminMoveViewModel;
	isPending: boolean;
	onPublish: () => Promise<void>;
	onUnpublish: () => Promise<void>;
	onDelete: () => void;
	onRestore: () => Promise<void>;
};

function ActionButtons({
	move,
	isPending,
	onPublish,
	onUnpublish,
	onDelete,
	onRestore,
}: ActionButtonsProps) {
	if (move.status === "Deleted") {
		return (
			<Button
				disabled={isPending}
				onClick={onRestore}
				size="sm"
				type="button"
				variant="outline"
			>
				Restore
			</Button>
		);
	}

	if (move.status === "Published") {
		return (
			<div className="flex justify-end gap-2">
				<Button
					disabled={isPending}
					onClick={onUnpublish}
					size="sm"
					type="button"
					variant="outline"
				>
					Unpublish
				</Button>
				<Button
					disabled={isPending}
					onClick={onDelete}
					size="sm"
					type="button"
					variant="destructive"
				>
					Delete
				</Button>
			</div>
		);
	}

	return (
		<div className="flex justify-end gap-2">
			<Button
				disabled={isPending}
				onClick={onPublish}
				size="sm"
				type="button"
				variant="default"
			>
				Publish
			</Button>
			<Button
				disabled={isPending}
				onClick={onDelete}
				size="sm"
				type="button"
				variant="destructive"
			>
				Delete
			</Button>
		</div>
	);
}

export function AdminMoveTableRow({ move }: AdminMoveTableRowProps) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const publishMutation = usePublishMoveMutation();
	const unpublishMutation = useUnpublishMoveMutation();
	const deleteMutation = useDeleteMoveMutation();
	const restoreMutation = useRestoreMoveMutation();

	const formattedDate = new Date(move.updatedAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	const isPending =
		publishMutation.isPending ||
		unpublishMutation.isPending ||
		deleteMutation.isPending ||
		restoreMutation.isPending;

	const handleDelete = async () => {
		await deleteMutation.mutateAsync(move.id);
		setShowDeleteDialog(false);
	};

	const handlePublish = async () => {
		await publishMutation.mutateAsync(move.id);
	};

	const handleUnpublish = async () => {
		await unpublishMutation.mutateAsync(move.id);
	};

	const handleRestore = async () => {
		await restoreMutation.mutateAsync(move.id);
	};

	return (
		<>
			<TableRow>
				<TableCell className="font-medium">{move.name}</TableCell>
				<TableCell>
					<Badge className={LEVEL_COLORS[move.level]} variant="secondary">
						{move.level}
					</Badge>
				</TableCell>
				<TableCell>
					<Badge className={STATUS_COLORS[move.status]} variant="secondary">
						{move.status}
					</Badge>
				</TableCell>
				<TableCell className="text-muted-foreground text-sm">
					{formattedDate}
				</TableCell>
				<TableCell className="text-right">
					<ActionButtons
						isPending={isPending}
						move={move}
						onDelete={() => {
							setShowDeleteDialog(true);
						}}
						onPublish={handlePublish}
						onRestore={handleRestore}
						onUnpublish={handleUnpublish}
					/>
				</TableCell>
			</TableRow>

			<AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Move</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{move.name}"? This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel type="button">Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={isPending}
							onClick={handleDelete}
							type="button"
						>
							{isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

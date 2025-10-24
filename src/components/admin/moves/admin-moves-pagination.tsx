import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminMovesPaginationProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

export function AdminMovesPagination({
	currentPage,
	totalPages,
	onPageChange,
}: AdminMovesPaginationProps) {
	const canGoPrevious = currentPage > 1;
	const canGoNext = currentPage < totalPages;

	return (
		<div className="flex items-center justify-center gap-2">
			<Button
				aria-label="Previous page"
				disabled={!canGoPrevious}
				onClick={() => {
					onPageChange(currentPage - 1);
				}}
				size="icon"
				type="button"
				variant="outline"
			>
				<ChevronLeft className="size-4" />
			</Button>

			<div className="px-4 text-muted-foreground text-sm">
				Page {currentPage} of {totalPages}
			</div>

			<Button
				aria-label="Next page"
				disabled={!canGoNext}
				onClick={() => {
					onPageChange(currentPage + 1);
				}}
				size="icon"
				type="button"
				variant="outline"
			>
				<ChevronRight className="size-4" />
			</Button>
		</div>
	);
}

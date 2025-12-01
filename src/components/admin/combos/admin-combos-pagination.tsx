import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminCombosPaginationProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

export function AdminCombosPagination({
	currentPage,
	totalPages,
	onPageChange,
}: AdminCombosPaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex items-center justify-center gap-4">
			<Button
				disabled={currentPage === 1}
				onClick={() => onPageChange(currentPage - 1)}
				size="sm"
				variant="outline"
			>
				<ChevronLeft className="mr-1 h-4 w-4" />
				Previous
			</Button>
			<span className="text-muted-foreground text-sm">
				Page {currentPage} of {totalPages}
			</span>
			<Button
				disabled={currentPage === totalPages}
				onClick={() => onPageChange(currentPage + 1)}
				size="sm"
				variant="outline"
			>
				Next
				<ChevronRight className="ml-1 h-4 w-4" />
			</Button>
		</div>
	);
}

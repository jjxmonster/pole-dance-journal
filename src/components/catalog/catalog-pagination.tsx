import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

type CatalogPaginationProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

export function CatalogPagination({
	currentPage,
	totalPages,
	onPageChange,
}: CatalogPaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	const handlePrevious = () => {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handleNext = () => {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	return (
		<div className="mt-8 flex items-center justify-center gap-4">
			<Button
				aria-label="Previous page"
				disabled={currentPage === 1}
				onClick={handlePrevious}
				size="sm"
				variant="outline"
			>
				<ChevronLeft className="h-4 w-4" />
				Previous
			</Button>

			<span className="text-muted-foreground text-sm">
				Page {currentPage} of {totalPages}
			</span>

			<Button
				aria-label="Next page"
				disabled={currentPage === totalPages}
				onClick={handleNext}
				size="sm"
				variant="outline"
			>
				Next
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}

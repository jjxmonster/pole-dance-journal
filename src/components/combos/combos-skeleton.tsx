import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function ComboSkeletonCard() {
	return (
		<Card className="h-full gap-0 py-0">
			<div className="p-4">
				<div className="mb-3 flex items-center gap-1.5">
					{Array.from({ length: 4 }, (_, i) => `skeleton-move-${i}`).map(
						(key) => (
							<Skeleton className="h-12 w-12 rounded-full" key={key} />
						)
					)}
				</div>
			</div>
			<CardContent className="space-y-2 px-4 pt-0 pb-4">
				<Skeleton className="h-5 w-3/4" />
				<div className="flex items-center justify-between">
					<Skeleton className="h-6 w-24 rounded-full" />
					<Skeleton className="h-4 w-16" />
				</div>
			</CardContent>
		</Card>
	);
}

type CombosSkeletonGridProps = {
	count?: number;
};

export function CombosSkeletonGrid({ count = 8 }: CombosSkeletonGridProps) {
	const skeletonKeys = Array.from(
		{ length: count },
		(_, index) => `skeleton-${index}`
	);

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{skeletonKeys.map((key) => (
				<ComboSkeletonCard key={key} />
			))}
		</div>
	);
}

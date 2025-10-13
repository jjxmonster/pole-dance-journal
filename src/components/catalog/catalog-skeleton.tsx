import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function CatalogSkeletonCard() {
	return (
		<Card className="h-full gap-0 py-0">
			<Skeleton className="aspect-[4/3] w-full rounded-t-xl" />
			<CardContent className="space-y-2 p-3">
				<Skeleton className="h-5 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
			</CardContent>
		</Card>
	);
}

type CatalogSkeletonGridProps = {
	count?: number;
};

export function CatalogSkeletonGrid({ count = 20 }: CatalogSkeletonGridProps) {
	const skeletonKeys = Array.from(
		{ length: count },
		(_, i) => `skeleton-${crypto.randomUUID()}-${i}`
	);

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{skeletonKeys.map((key) => (
				<CatalogSkeletonCard key={key} />
			))}
		</div>
	);
}

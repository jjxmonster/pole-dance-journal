import { Skeleton } from "../ui/skeleton";

export function LoadingState() {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{Array.from({ length: 8 }).map(() => (
				<div className="space-y-3" key={crypto.randomUUID()}>
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-4 w-1/2" />
				</div>
			))}
		</div>
	);
}

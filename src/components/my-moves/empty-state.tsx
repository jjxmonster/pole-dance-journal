import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";

export function EmptyState() {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
			<div className="mx-auto max-w-md">
				<h3 className="mb-2 font-semibold text-lg">
					Nie masz jeszcze żadnych ruchów
				</h3>
				<p className="mb-6 text-muted-foreground text-sm">
					Zacznij dodawać ruchy do swojej kolekcji, aby śledzić swoje postępy.
					Przeglądaj katalog i wybierz ruchy, które chcesz ćwiczyć.
				</p>
				<Button asChild type="button">
					<Link to="/catalog">Przeglądaj katalog</Link>
				</Button>
			</div>
		</div>
	);
}

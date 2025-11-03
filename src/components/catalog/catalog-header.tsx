import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Dices, Loader2 } from "lucide-react";
import { orpc } from "@/orpc/client";
import { Button } from "../ui/button";

export function CatalogHeader() {
	const navigate = useNavigate();

	const { mutate, isPending } = useMutation({
		mutationFn: () => orpc.moves.getRandomMove.call(),
		onSuccess: (data) => {
			navigate({ to: "/moves/$slug", params: { slug: data.slug } });
		},
	});

	return (
		<div
			className="mb-8 flex items-start justify-between"
			data-testid="catalog-header"
		>
			<div>
				<h1 className="mb-2 font-semibold text-5xl text-foreground">
					Figury Pole Dance
				</h1>
				<p className="text-muted-foreground">
					Przeglądaj i śledź swoje postępy dzięki katalogowi figur.
				</p>
			</div>
			<Button
				className="cursor-pointer"
				disabled={isPending}
				onClick={() => mutate()}
				variant="default"
			>
				{isPending ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<Dices className="mr-2 h-4 w-4" />
				)}
				Losowa Figura
			</Button>
		</div>
	);
}

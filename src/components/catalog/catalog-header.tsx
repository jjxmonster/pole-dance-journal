import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Dices } from "lucide-react";
import { useState } from "react";
import { orpc } from "@/orpc/client";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { WheelOfFortune } from "./wheel-of-fortune";

const WHEEL_RESULT_DELAY_MS = 2000;

export function CatalogHeader() {
	const navigate = useNavigate();
	const [isWheelOpen, setIsWheelOpen] = useState(false);
	const [isSpinning, setIsSpinning] = useState(false);

	const { data: wheelData, refetch } = useQuery({
		queryKey: ["wheelMoves"],
		queryFn: () => orpc.moves.getRandomMovesForWheel.call({ count: 10 }),
		enabled: isWheelOpen,
	});

	const handleSpinComplete = (selectedSlug: string) => {
		setTimeout(() => {
			setIsWheelOpen(false);
			setIsSpinning(false);
			navigate({ to: "/moves/$slug", params: { slug: selectedSlug } });
		}, WHEEL_RESULT_DELAY_MS);
	};

	const handleOpenWheel = () => {
		setIsWheelOpen(true);
		refetch();
	};

	return (
		<>
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
					className="hidden md:flex"
					onClick={handleOpenWheel}
					variant="default"
				>
					<Dices className="mr-2 h-4 w-4" />
					Losuj figurę
				</Button>
				<Button
					className="fixed right-10 bottom-10 z-50 shadow-lg md:hidden"
					onClick={handleOpenWheel}
					size="lg"
					variant="default"
				>
					<Dices className="mr-1 h-4 w-4" />
					Losuj figurę
				</Button>
			</div>

			<Dialog onOpenChange={setIsWheelOpen} open={isWheelOpen}>
				<DialogContent className="max-w-[90vw] md:max-w-2xl">
					<DialogHeader>
						<DialogTitle>Losowa Figura</DialogTitle>
						<DialogDescription>
							Zakręć kołem, aby wylosować figurę!
						</DialogDescription>
					</DialogHeader>

					{wheelData?.moves && wheelData.moves.length > 0 ? (
						<WheelOfFortune
							isSpinning={isSpinning}
							onSpinComplete={handleSpinComplete}
							segments={wheelData.moves}
						/>
					) : (
						<div className="flex items-center justify-center py-12">
							<p className="text-muted-foreground">Ładowanie...</p>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

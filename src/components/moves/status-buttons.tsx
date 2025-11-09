import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import Confetti from "react-canvas-confetti";
import { createPortal } from "react-dom";
import { m } from "@/paraglide/messages";
import type { MoveStatus } from "@/types/move";
import { STATUS_OPTIONS } from "@/utils/constants";
import { translateStatusMessage } from "@/utils/status-messages";
import { Button } from "../ui/button";

type StatusButtonsProps = {
	value: MoveStatus | null;
	onChange: (status: MoveStatus) => void;
	disabled?: boolean;
};

const CONFETTI_PARTICLE_COUNT = 100;
const CONFETTI_SPREAD = 70;
const CONFETTI_RESET_TIME_MS = 2000;

export function StatusButtons({
	value,
	onChange,
	disabled,
}: StatusButtonsProps) {
	const doneButtonRef = useRef<HTMLButtonElement>(null);
	const confettiRef = useRef<unknown>(null);
	const [showConfetti, setShowConfetti] = useState(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const triggerConfetti = () => {
		if (
			doneButtonRef.current &&
			confettiRef.current &&
			typeof confettiRef.current === "function"
		) {
			const rect = doneButtonRef.current.getBoundingClientRect();

			(confettiRef.current as (options: unknown) => void)({
				particleCount: CONFETTI_PARTICLE_COUNT,
				spread: CONFETTI_SPREAD,
				origin: {
					x: (rect.left + rect.width / 2) / window.innerWidth,
					y: (rect.top + rect.height / 2) / window.innerHeight,
				},
			});

			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}

			timerRef.current = setTimeout(() => {
				setShowConfetti(false);
			}, CONFETTI_RESET_TIME_MS);
		}
	};

	const handleStatusChange = (status: MoveStatus) => {
		if (status === value) {
			return;
		}

		if (status === "DONE") {
			setShowConfetti(true);
			setTimeout(() => {
				triggerConfetti();
			}, 0);
		}

		onChange(status);
	};

	return (
		<div
			className="flex w-full flex-col gap-2"
			data-testid="status-buttons-container"
		>
			<h2 className="font-medium text-lg">{m.move_status_label()}</h2>
			<div className="flex flex-col gap-2">
				{STATUS_OPTIONS.map((option) => {
					const isSelected = option.value === value;
					const buttonVariant: "default" | "outline" | "secondary" = isSelected
						? "default"
						: "outline";

					return (
						<Button
							className="w-full justify-center"
							data-status={option.value}
							data-testid={`status-button-${option.value}-${isSelected ? "active" : "inactive"}`}
							disabled={disabled}
							key={option.value}
							onClick={() => handleStatusChange(option.value)}
							ref={option.value === "DONE" ? doneButtonRef : null}
							type="button"
							variant={buttonVariant}
						>
							{translateStatusMessage(option.messageKey)}
							{disabled && <Loader2 className="size-4 animate-spin" />}
						</Button>
					);
				})}
			</div>
			{showConfetti &&
				createPortal(
					<Confetti
						onInit={({ confetti: conf }) => {
							confettiRef.current = conf;
						}}
						style={{
							position: "fixed",
							pointerEvents: "none",
							width: "100%",
							height: "100%",
							top: 0,
							left: 0,
						}}
					/>,
					document.body
				)}
		</div>
	);
}

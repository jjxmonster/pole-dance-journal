import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

type WheelSegment = {
	id: string;
	name: string;
	slug: string;
	imageUrl: string | null;
	level: "Beginner" | "Intermediate" | "Advanced";
};

type WheelOfFortuneProps = {
	segments: WheelSegment[];
	onSpinComplete: (selectedSlug: string) => void;
	isSpinning?: boolean;
};

const CANVAS_SIZE = 400;
const CANVAS_MARGIN = 10;
const CENTER_CIRCLE_RADIUS = 20;
const STROKE_WIDTH = 2;
const TEXT_FONT_SIZE = 14;
const TEXT_RADIUS_MULTIPLIER = 0.6;
const NUMBER_OF_SPINS = 5;
const SPIN_DURATION_MS = 4000;
const WHEEL_BORDER_WIDTH = 2;
const DEGREES_PER_CIRCLE = 360;
const RADIANS_DIVISOR = 180;

export function WheelOfFortune({
	segments,
	onSpinComplete,
}: WheelOfFortuneProps) {
	const [rotation, setRotation] = useState(0);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [isSpinning, setIsSpinning] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const segmentAngle = DEGREES_PER_CIRCLE / segments.length;

	useEffect(() => {
		drawWheel();
	}, [segments]);

	const drawWheel = () => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}

		const centerX = canvas.width / WHEEL_BORDER_WIDTH;
		const centerY = canvas.height / WHEEL_BORDER_WIDTH;
		const radius = Math.min(centerX, centerY) - CANVAS_MARGIN;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		segments.forEach((segment, index) => {
			const startAngle = (index * segmentAngle * Math.PI) / RADIANS_DIVISOR;
			const endAngle = ((index + 1) * segmentAngle * Math.PI) / RADIANS_DIVISOR;

			ctx.beginPath();
			ctx.moveTo(centerX, centerY);
			ctx.arc(centerX, centerY, radius, startAngle, endAngle);
			ctx.closePath();

			const colors = {
				Beginner: ["#10b981", "#059669"],
				Intermediate: ["#f59e0b", "#d97706"],
				Advanced: ["#ef4444", "#dc2626"],
			};

			const colorPair = colors[segment.level];
			ctx.fillStyle = colorPair[index % WHEEL_BORDER_WIDTH];
			ctx.fill();

			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = STROKE_WIDTH;
			ctx.stroke();

			ctx.save();
			ctx.translate(centerX, centerY);
			ctx.rotate(startAngle + (endAngle - startAngle) / WHEEL_BORDER_WIDTH);
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#ffffff";
			ctx.font = `bold ${TEXT_FONT_SIZE}px system-ui`;

			const maxWidth = radius * TEXT_RADIUS_MULTIPLIER;
			const text = segment.name;
			ctx.fillText(text, radius * TEXT_RADIUS_MULTIPLIER, 0, maxWidth);

			ctx.restore();
		});

		ctx.beginPath();
		ctx.arc(centerX, centerY, CENTER_CIRCLE_RADIUS, 0, 2 * Math.PI);
		ctx.fillStyle = "#ffffff";
		ctx.fill();
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = STROKE_WIDTH;
		ctx.stroke();
	};

	const spinWheel = () => {
		if (isSpinning || segments.length === 0) {
			return;
		}

		setIsSpinning(true);
		const randomIndex = Math.floor(Math.random() * segments.length);
		setSelectedIndex(randomIndex);

		const targetAngle = randomIndex * segmentAngle;
		const totalRotation =
			DEGREES_PER_CIRCLE * NUMBER_OF_SPINS +
			(DEGREES_PER_CIRCLE - targetAngle) +
			segmentAngle / WHEEL_BORDER_WIDTH;

		setRotation((prev) => prev + totalRotation);

		setTimeout(() => {
			setIsSpinning(false);
			onSpinComplete(segments[randomIndex].slug);
		}, SPIN_DURATION_MS);
	};

	return (
		<div className="flex flex-col items-center gap-6">
			<div className="relative">
				<div
					className="-translate-x-1/2 -translate-y-2 absolute top-0 left-1/2 z-10 h-0 w-0 border-x-[15px] border-x-transparent border-b-[25px] border-b-red-500"
					style={{
						filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
					}}
				/>

				<canvas
					className="rounded-full shadow-2xl"
					height={CANVAS_SIZE}
					ref={canvasRef}
					style={{
						transform: `rotate(${rotation}deg)`,
						transition: isSpinning
							? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
							: "none",
					}}
					width={CANVAS_SIZE}
				/>
			</div>

			<Button
				className="min-w-[200px]"
				disabled={isSpinning || segments.length === 0}
				onClick={spinWheel}
				size="lg"
			>
				{isSpinning ? "Kręcenie..." : "Zakręć Kołem!"}
			</Button>

			{selectedIndex !== null && !isSpinning && (
				<div className="text-center">
					<p className="font-semibold text-lg">Wylosowano:</p>
					<p className="font-bold text-2xl">{segments[selectedIndex].name}</p>
				</div>
			)}
		</div>
	);
}

type StepCardProps = {
	orderIndex: number;
	title: string;
	description: string;
};

export function StepCard({ orderIndex, title, description }: StepCardProps) {
	return (
		<li className="flex gap-4 rounded-lg border border-border bg-card p-6">
			<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
				{orderIndex}
			</span>
			<div className="flex-1">
				<h3 className="mb-2 font-semibold text-card-foreground text-lg">
					{title}
				</h3>
				<p className="text-muted-foreground">{description}</p>
			</div>
		</li>
	);
}

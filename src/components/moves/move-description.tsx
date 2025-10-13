type MoveDescriptionProps = {
	description: string;
};

export function MoveDescription({ description }: MoveDescriptionProps) {
	return (
		<section>
			<p className="text-foreground text-lg leading-relaxed">{description}</p>
		</section>
	);
}

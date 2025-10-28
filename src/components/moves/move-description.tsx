type MoveDescriptionProps = {
	description: string;
};

export function MoveDescription({ description }: MoveDescriptionProps) {
	return (
		<section data-testid="move-description">
			<p className="text-foreground text-lg leading-relaxed">{description}</p>
		</section>
	);
}

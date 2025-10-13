type MoveImageProps = {
	imageUrl: string | null;
	alt: string;
};

export function MoveImage({ imageUrl, alt }: MoveImageProps) {
	if (!imageUrl) {
		return null;
	}

	return (
		<figure className="overflow-hidden rounded-lg">
			<img alt={alt} className="h-auto w-full object-cover" src={imageUrl} />
		</figure>
	);
}

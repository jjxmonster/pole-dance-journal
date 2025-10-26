import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/orpc/client";

type ImageGeneratorProps = {
	moveId: string;
	isDisabled: boolean;
	onImageAccepted: (imageUrl: string) => void;
};

export function ImageGenerator({
	moveId,
	isDisabled,
	onImageAccepted,
}: ImageGeneratorProps) {
	const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(
		null
	);
	const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

	const uploadReferenceImageMutation = useMutation({
		mutationFn: (file: File) =>
			orpc.admin.moves.uploadReferenceImage.call({
				file,
				moveId,
			}),
		onSuccess: (data) => {
			setReferenceImageUrl(data.referenceImageUrl);
			toast.success("Reference image uploaded successfully");
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to upload image";
			toast.error(errorMessage);
		},
	});

	const generateImageMutation = useMutation({
		mutationFn: () => {
			if (!referenceImageUrl) {
				throw new Error("Reference image URL is required");
			}
			return orpc.admin.moves.generateImage.call({
				moveId,
				referenceImageUrl,
			});
		},
		onSuccess: (data) => {
			setPreviewImageUrl(data.previewUrl);
			toast.success("Image generated successfully");
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to generate image";
			toast.error(errorMessage);
		},
	});

	const acceptImageMutation = useMutation({
		mutationFn: () => {
			if (!previewImageUrl) {
				throw new Error("No image to accept");
			}
			return orpc.admin.moves.acceptImage.call({
				moveId,
				imageUrl: previewImageUrl,
			});
		},
		onSuccess: () => {
			if (previewImageUrl) {
				onImageAccepted(previewImageUrl);
			}
			toast.success("Image accepted successfully");
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to accept image";
			toast.error(errorMessage);
		},
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		uploadReferenceImageMutation.mutate(file);
	};

	const hasError =
		uploadReferenceImageMutation.isError ||
		generateImageMutation.isError ||
		acceptImageMutation.isError;

	return (
		<div className="space-y-6 rounded-lg border border-border bg-card p-6">
			<div>
				<h3 className="mb-4 font-semibold text-lg">Generate Move Image</h3>

				<div className="space-y-4">
					<div>
						<Label
							className="mb-2 block font-medium text-sm"
							htmlFor="reference-image"
						>
							Reference Image
						</Label>
						<Input
							accept="image/jpeg,image/png,image/webp"
							disabled={isDisabled || uploadReferenceImageMutation.isPending}
							id="reference-image"
							onChange={handleFileChange}
							type="file"
						/>
						{uploadReferenceImageMutation.isPending && (
							<p className="mt-2 text-muted-foreground text-sm">
								Uploading image...
							</p>
						)}
						{referenceImageUrl && (
							<div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted">
								<img
									alt="Reference for AI generation"
									className="h-auto w-full"
									src={referenceImageUrl}
								/>
							</div>
						)}
					</div>

					{referenceImageUrl && (
						<>
							<div className="flex gap-3">
								<Button
									className="flex-1"
									disabled={
										isDisabled ||
										generateImageMutation.isPending ||
										!referenceImageUrl
									}
									onClick={() => generateImageMutation.mutate()}
									type="button"
								>
									{generateImageMutation.isPending
										? "Generating..."
										: "Generate Image"}
								</Button>
							</div>

							{previewImageUrl && (
								<>
									<div className="overflow-hidden rounded-lg border border-border bg-muted">
										<img
											alt="Generated preview"
											className="h-auto w-full"
											src={previewImageUrl}
										/>
									</div>

									<div className="flex gap-3">
										<Button
											className="flex-1"
											disabled={isDisabled || generateImageMutation.isPending}
											onClick={() => generateImageMutation.mutate()}
											type="button"
											variant="outline"
										>
											Regenerate
										</Button>
										<Button
											className="flex-1"
											disabled={isDisabled || acceptImageMutation.isPending}
											onClick={() => acceptImageMutation.mutate()}
											type="button"
										>
											{acceptImageMutation.isPending
												? "Accepting..."
												: "Accept Image"}
										</Button>
									</div>
								</>
							)}
						</>
					)}

					{hasError && (
						<Alert variant="destructive">
							<AlertDescription>
								{uploadReferenceImageMutation.error instanceof Error &&
									uploadReferenceImageMutation.error.message}
								{generateImageMutation.error instanceof Error &&
									generateImageMutation.error.message}
								{acceptImageMutation.error instanceof Error &&
									acceptImageMutation.error.message}
							</AlertDescription>
						</Alert>
					)}
				</div>
			</div>
		</div>
	);
}

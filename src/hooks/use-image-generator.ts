import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/orpc/client";

export function useImageUpload(
	moveId: string,
	onSuccess: (url: string) => void
) {
	return useMutation({
		mutationFn: (file: File) =>
			orpc.admin.moves.uploadReferenceImage.call({
				file,
				moveId,
			}),
		onSuccess: (data) => {
			onSuccess(data.referenceImageUrl);
			toast.success("Reference image uploaded successfully");
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to upload image";
			toast.error(errorMessage);
		},
	});
}

export function useImageGeneration(
	moveId: string,
	referenceImageUrl: string | null,
	customPromptAddition: string,
	onSuccess: (url: string) => void
) {
	return useMutation({
		mutationFn: () => {
			if (!referenceImageUrl) {
				throw new Error("Reference image URL is required");
			}
			return orpc.admin.moves.generateImage.call({
				moveId,
				referenceImageUrl,
				customPromptAddition: customPromptAddition.trim() || undefined,
			});
		},
		onSuccess: (data) => {
			onSuccess(data.previewUrl);
			toast.success("Image generated successfully");
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to generate image";
			toast.error(errorMessage);
		},
	});
}

export function useImageAcceptance(
	moveId: string,
	previewImageUrl: string | null,
	onSuccess: (url: string) => void
) {
	return useMutation({
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
				onSuccess(previewImageUrl);
			}
			toast.success("Image accepted successfully");
		},
		onError: (error) => {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to accept image";
			toast.error(errorMessage);
		},
	});
}

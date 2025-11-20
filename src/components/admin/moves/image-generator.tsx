import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	useImageAcceptance,
	useImageGeneration,
	useImageUpload,
} from "@/hooks/use-image-generator";

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
	const [customPromptAddition, setCustomPromptAddition] = useState("");

	const uploadReferenceImageMutation = useImageUpload(
		moveId,
		setReferenceImageUrl
	);

	const generateImageMutation = useImageGeneration(
		moveId,
		referenceImageUrl,
		customPromptAddition,
		setPreviewImageUrl
	);

	const acceptImageMutation = useImageAcceptance(
		moveId,
		previewImageUrl,
		onImageAccepted
	);

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
					<ReferenceImageUpload
						isDisabled={isDisabled}
						isPending={uploadReferenceImageMutation.isPending}
						onFileChange={handleFileChange}
						referenceImageUrl={referenceImageUrl}
					/>

					{referenceImageUrl && (
						<GenerationControls
							customPromptAddition={customPromptAddition}
							isDisabled={isDisabled}
							isGenerating={generateImageMutation.isPending}
							onCustomPromptChange={setCustomPromptAddition}
							onGenerate={() => generateImageMutation.mutate()}
						/>
					)}

					{previewImageUrl && (
						<PreviewSection
							acceptImageMutation={acceptImageMutation}
							generateImageMutation={generateImageMutation}
							isDisabled={isDisabled}
							previewImageUrl={previewImageUrl}
						/>
					)}

					{hasError && (
						<ErrorDisplay
							acceptImageError={acceptImageMutation.error}
							generateImageError={generateImageMutation.error}
							uploadImageError={uploadReferenceImageMutation.error}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

function ReferenceImageUpload({
	isDisabled,
	isPending,
	onFileChange,
	referenceImageUrl,
}: {
	isDisabled: boolean;
	isPending: boolean;
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	referenceImageUrl: string | null;
}) {
	return (
		<div>
			<Label
				className="mb-2 block font-medium text-sm"
				htmlFor="reference-image"
			>
				Reference Image
			</Label>
			<Input
				accept="image/jpeg,image/png,image/webp"
				disabled={isDisabled || isPending}
				id="reference-image"
				onChange={onFileChange}
				type="file"
			/>
			{isPending && (
				<p className="mt-2 text-muted-foreground text-sm">Uploading image...</p>
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
	);
}

function GenerationControls({
	customPromptAddition,
	isDisabled,
	isGenerating,
	onCustomPromptChange,
	onGenerate,
}: {
	customPromptAddition: string;
	isDisabled: boolean;
	isGenerating: boolean;
	onCustomPromptChange: (value: string) => void;
	onGenerate: () => void;
}) {
	return (
		<>
			<div>
				<Label
					className="mb-2 block font-medium text-sm"
					htmlFor="custom-prompt"
				>
					Additional Prompt (Optional)
				</Label>
				<Textarea
					className="min-h-[100px] resize-y"
					disabled={isDisabled || isGenerating}
					id="custom-prompt"
					maxLength={500}
					onChange={(e) => onCustomPromptChange(e.target.value)}
					placeholder="Add any specific requirements or modifications to the default prompt..."
					value={customPromptAddition}
				/>
				<p className="mt-1 text-muted-foreground text-xs">
					{customPromptAddition.length}/500 characters
				</p>
			</div>

			<div className="flex gap-3">
				<Button
					className="flex-1"
					disabled={isDisabled || isGenerating}
					onClick={onGenerate}
					type="button"
				>
					{isGenerating ? "Generating..." : "Generate Image"}
				</Button>
			</div>
		</>
	);
}

type PreviewSectionProps = {
	previewImageUrl: string;
	isDisabled: boolean;
	generateImageMutation: ReturnType<typeof useImageGeneration>;
	acceptImageMutation: ReturnType<typeof useImageAcceptance>;
};

function PreviewSection({
	previewImageUrl,
	isDisabled,
	generateImageMutation,
	acceptImageMutation,
}: PreviewSectionProps) {
	return (
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
					{acceptImageMutation.isPending ? "Accepting..." : "Accept Image"}
				</Button>
			</div>
		</>
	);
}

function ErrorDisplay({
	uploadImageError,
	generateImageError,
	acceptImageError,
}: {
	uploadImageError: Error | null;
	generateImageError: Error | null;
	acceptImageError: Error | null;
}) {
	return (
		<Alert variant="destructive">
			<AlertDescription>
				{uploadImageError instanceof Error && uploadImageError.message}
				{generateImageError instanceof Error && generateImageError.message}
				{acceptImageError instanceof Error && acceptImageError.message}
			</AlertDescription>
		</Alert>
	);
}

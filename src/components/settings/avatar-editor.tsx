import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Upload, User } from "lucide-react";
import { useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { orpc } from "@/orpc/client";

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * BYTES_PER_MB;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SUCCESS_MESSAGE_TIMEOUT = 3000;

type AvatarEditorProps = {
	currentAvatarUrl: string | null;
	onUpdate: () => void;
};

export function AvatarEditor({
	currentAvatarUrl,
	onUpdate,
}: AvatarEditorProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [showSuccess, setShowSuccess] = useState(false);
	const [showError, setShowError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const mutation = useMutation({
		mutationFn: (file: File) => orpc.profiles.uploadAvatar.call({ file }),
		onSuccess: () => {
			setShowSuccess(true);
			setShowError(false);
			setSelectedFile(null);
			setPreviewUrl(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			onUpdate();
			setTimeout(() => {
				setShowSuccess(false);
			}, SUCCESS_MESSAGE_TIMEOUT);
		},
		onError: (error: Error) => {
			setShowError(true);
			setShowSuccess(false);
			setErrorMessage(error.message || "Failed to upload avatar");
		},
	});

	const validateFile = (file: File): string | null => {
		if (!ALLOWED_TYPES.includes(file.type)) {
			return "Invalid file type. Please upload a JPEG, PNG, or WebP image.";
		}
		if (file.size > MAX_FILE_SIZE) {
			return "File size exceeds 10MB limit.";
		}
		return null;
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		const error = validateFile(file);
		if (error) {
			setShowError(true);
			setErrorMessage(error);
			setSelectedFile(null);
			setPreviewUrl(null);
			return;
		}

		setShowError(false);
		setSelectedFile(file);

		const reader = new FileReader();
		reader.addEventListener("load", () => {
			setPreviewUrl(reader.result as string);
		});
		reader.readAsDataURL(file);
	};

	const handleUpload = () => {
		if (!selectedFile) {
			return;
		}
		mutation.mutate(selectedFile);
	};

	const displayUrl = previewUrl || currentAvatarUrl;

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-6">
				<Avatar className="size-32">
					{displayUrl ? (
						<AvatarImage alt="Avatar preview" src={displayUrl} />
					) : null}
					<AvatarFallback>
						<User className="size-16" />
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 space-y-2">
					<Label htmlFor="avatar-upload">Upload New Avatar</Label>
					<input
						accept={ALLOWED_TYPES.join(",")}
						className="block w-full text-foreground text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-primary-foreground file:text-sm hover:file:bg-primary/90"
						disabled={mutation.isPending}
						id="avatar-upload"
						onChange={handleFileSelect}
						ref={fileInputRef}
						type="file"
					/>
					<p className="text-muted-foreground text-sm">
						JPEG, PNG, or WebP (max 10MB)
					</p>
				</div>
			</div>

			{showSuccess && (
				<Alert>
					<CheckCircle2 className="size-4" />
					<AlertDescription>Avatar updated successfully!</AlertDescription>
				</Alert>
			)}

			{showError && (
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}

			<Button
				disabled={!selectedFile || mutation.isPending}
				onClick={handleUpload}
				type="button"
			>
				{mutation.isPending ? (
					"Uploading..."
				) : (
					<>
						<Upload className="mr-2 size-4" />
						Upload Avatar
					</>
				)}
			</Button>
		</div>
	);
}

import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Upload, User } from "lucide-react";
import { useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-6">
				<button
					className="group relative cursor-pointer"
					disabled={mutation.isPending}
					onClick={handleAvatarClick}
					type="button"
				>
					<Avatar className="size-20">
						{displayUrl ? (
							<AvatarImage alt="Avatar preview" src={displayUrl} />
						) : null}
						<AvatarFallback>
							<User className="size-10" />
						</AvatarFallback>
					</Avatar>
					<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
						<Upload className="size-6 text-white" />
					</div>
				</button>

				<div className="flex-1">
					<p className="text-muted-foreground text-sm">
						Update your avatar by clicking the image. Size recommended is
						288x288 px. JPEG, PNG or WebP format only (max 10MB).
					</p>
				</div>

				<input
					accept={ALLOWED_TYPES.join(",")}
					className="hidden"
					disabled={mutation.isPending}
					id="avatar-upload"
					onChange={handleFileSelect}
					ref={fileInputRef}
					type="file"
				/>
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

			{selectedFile && (
				<Button
					disabled={mutation.isPending}
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
			)}
		</div>
	);
}

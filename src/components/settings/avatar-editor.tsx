import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Upload, User } from "lucide-react";
import { useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/client";
import { m } from "@/paraglide/messages";

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
			return m.settings_avatar_error_invalid_type();
		}
		if (file.size > MAX_FILE_SIZE) {
			return m.settings_avatar_error_size();
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
							<AvatarImage
								alt={m.settings_avatar_placeholder_alt()}
								src={displayUrl}
							/>
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
						{m.settings_avatar_helper()}
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
					<AlertDescription>{m.settings_avatar_success()}</AlertDescription>
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
						m.settings_avatar_uploading()
					) : (
						<>
							<Upload className="mr-2 size-4" />
							{m.settings_avatar_upload_button()}
						</>
					)}
				</Button>
			)}
		</div>
	);
}

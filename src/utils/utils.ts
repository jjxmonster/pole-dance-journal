import { ORPCError } from "@orpc/client";
import { UPLOAD_REFERENCE_IMAGE_VALIDATION } from "@/orpc/schema";
import type { ImageUploadValidationError } from "@/services/image-upload";
import {
	BASE_36_RADIX,
	DEFAULT_FILE_EXTENSION,
	DOT_CHARACTER,
	PLURAL_THRESHOLD,
	RANDOM_STRING_END_INDEX,
	RANDOM_STRING_START_INDEX,
} from "./constants";

export function getPluralForm(count: number): string {
	if (count === 1) {
		return "move";
	}
	if (count < PLURAL_THRESHOLD) {
		return "moves";
	}
	return "moves";
}

export function validateInputFile(file: File): void {
	if (!file) {
		throw new ORPCError("BAD_REQUEST", {
			message: "File is required.",
		});
	}

	if (
		!UPLOAD_REFERENCE_IMAGE_VALIDATION.ALLOWED_MIME_TYPES.includes(
			file.type as (typeof UPLOAD_REFERENCE_IMAGE_VALIDATION.ALLOWED_MIME_TYPES)[number]
		)
	) {
		throw new ORPCError("BAD_REQUEST", {
			message: "Invalid file format. Only JPEG, PNG, and WebP are supported.",
		});
	}

	if (file.size > UPLOAD_REFERENCE_IMAGE_VALIDATION.MAX_FILE_SIZE) {
		throw new ORPCError("BAD_REQUEST", {
			message: "File size exceeds maximum limit of 10MB.",
		});
	}
}

export function validateFileFormat(
	file: File
): ImageUploadValidationError | null {
	if (
		!UPLOAD_REFERENCE_IMAGE_VALIDATION.ALLOWED_MIME_TYPES.includes(
			file.type as (typeof UPLOAD_REFERENCE_IMAGE_VALIDATION.ALLOWED_MIME_TYPES)[number]
		)
	) {
		return {
			type: "INVALID_FORMAT",
			message: "Invalid file format. Only JPEG, PNG, and WebP are supported.",
		};
	}
	return null;
}

export function validateFileSize(
	file: File
): ImageUploadValidationError | null {
	if (file.size > UPLOAD_REFERENCE_IMAGE_VALIDATION.MAX_FILE_SIZE) {
		return {
			type: "SIZE_EXCEEDS_LIMIT",
			message: "File size exceeds maximum limit of 10MB.",
		};
	}
	return null;
}

export function generateStoragePath(
	userId: string,
	file: File
): { path: string; filename: string } {
	const timestamp = Date.now();
	const randomId = Math.random()
		.toString(BASE_36_RADIX)
		.substring(RANDOM_STRING_START_INDEX, RANDOM_STRING_END_INDEX);
	const fileExtension =
		file.name.split(DOT_CHARACTER).pop() || DEFAULT_FILE_EXTENSION;
	const filename = `image.${fileExtension}`;

	return {
		path: `temp/${userId}-${timestamp}-${randomId}`,
		filename,
	};
}

export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

import { getSupabaseServerClient } from "@/integrations/supabase/server";
import {
	CACHE_CONTROL_SECONDS,
	HOURS_PER_DAY,
	MINUTES_PER_HOUR,
	MS_PER_SECOND,
	SECONDS_PER_MINUTE,
	SIGNED_URL_EXPIRATION_SECONDS,
} from "@/utils/constants";

import {
	generateStoragePath,
	validateFileFormat,
	validateFileSize,
} from "@/utils/utils";

export type ImageUploadValidationError = {
	type: "INVALID_FORMAT" | "SIZE_EXCEEDS_LIMIT" | "FILE_REQUIRED";
	message: string;
};

export type ImageUploadResult = {
	referenceImageUrl: string;
	uploadedAt: Date;
	expiresAt: Date;
};

export async function uploadReferenceImage(
	file: File,
	userId: string
): Promise<ImageUploadResult> {
	const formatError = validateFileFormat(file);
	if (formatError) {
		throw new Error(formatError.message);
	}

	const sizeError = validateFileSize(file);
	if (sizeError) {
		throw new Error(sizeError.message);
	}

	const { path, filename } = generateStoragePath(userId, file);
	const supabase = getSupabaseServerClient();

	const { data, error } = await supabase.storage
		.from("moves-images")
		.upload(`${path}/${filename}`, file, {
			cacheControl: CACHE_CONTROL_SECONDS.toString(),
			upsert: false,
		});

	if (error) {
		throw new Error("Failed to upload image to storage. Please try again.");
	}

	if (!data) {
		throw new Error("Failed to upload image to storage. Please try again.");
	}

	const { data: urlData, error: urlError } = await supabase.storage
		.from("moves-images")
		.createSignedUrl(`${path}/${filename}`, SIGNED_URL_EXPIRATION_SECONDS);

	if (urlError || !urlData) {
		throw new Error("Failed to generate image URL. Please try again.");
	}

	const uploadedAt = new Date();
	const expiresAt = new Date(
		uploadedAt.getTime() +
			HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND
	);

	return {
		referenceImageUrl: urlData.signedUrl,
		uploadedAt,
		expiresAt,
	};
}

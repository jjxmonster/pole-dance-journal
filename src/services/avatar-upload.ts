import { getSupabaseServerClient } from "@/integrations/supabase/server";
import {
	CACHE_CONTROL_SECONDS,
	SIGNED_URL_EXPIRATION_SECONDS,
} from "@/utils/constants";
import { validateFileFormat, validateFileSize } from "@/utils/utils";

export type AvatarUploadResult = {
	avatarUrl: string;
};

export async function uploadAvatarToStorage(
	file: File,
	userId: string
): Promise<AvatarUploadResult> {
	const formatError = validateFileFormat(file);
	if (formatError) {
		throw new Error(formatError.message);
	}

	const sizeError = validateFileSize(file);
	if (sizeError) {
		throw new Error(sizeError.message);
	}

	const path = `/${userId}/avatar.jpg`;
	const supabase = getSupabaseServerClient();

	const { data, error } = await supabase.storage
		.from("avatars")
		.upload(path, file, {
			cacheControl: CACHE_CONTROL_SECONDS.toString(),
			upsert: true,
			contentType: "image/jpeg",
		});

	if (error) {
		throw new Error("Failed to upload avatar to storage. Please try again.");
	}

	if (!data) {
		throw new Error("Failed to upload avatar to storage. Please try again.");
	}

	return {
		avatarUrl: path,
	};
}

export async function getSignedAvatarUrl(
	avatarUrl: string
): Promise<string | null> {
	try {
		const supabase = getSupabaseServerClient();

		const { data, error } = await supabase.storage
			.from("avatars")
			.createSignedUrl(avatarUrl, SIGNED_URL_EXPIRATION_SECONDS);

		if (error || !data) {
			return avatarUrl;
		}

		return data.signedUrl;
	} catch {
		return avatarUrl;
	}
}

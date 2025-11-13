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
			upsert: false,
			contentType: "image/jpeg",
		});

	if (error) {
		throw new Error("Failed to upload avatar to storage. Please try again.");
	}

	if (!data) {
		throw new Error("Failed to upload avatar to storage. Please try again.");
	}

	const { data: publicUrlData } = supabase.storage
		.from("avatars")
		.getPublicUrl(path);

	if (!publicUrlData) {
		throw new Error("Failed to generate avatar URL. Please try again.");
	}

	return {
		avatarUrl: publicUrlData.publicUrl,
	};
}

export async function getSignedAvatarUrl(
	avatarUrl: string
): Promise<string | null> {
	if (!avatarUrl) {
		return null;
	}

	if (!avatarUrl.includes("supabase")) {
		return avatarUrl;
	}

	try {
		const url = new URL(avatarUrl);
		const pathParts = url.pathname.split("/");
		const bucketIndex = pathParts.indexOf("avatars");

		if (bucketIndex === -1) {
			return avatarUrl;
		}

		const filePath = pathParts.slice(bucketIndex + 1).join("/");
		const supabase = getSupabaseServerClient();

		const { data, error } = await supabase.storage
			.from("avatars")
			.createSignedUrl(filePath, SIGNED_URL_EXPIRATION_SECONDS);

		if (error || !data) {
			return avatarUrl;
		}

		return data.signedUrl;
	} catch {
		return avatarUrl;
	}
}

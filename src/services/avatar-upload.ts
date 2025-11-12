import { getSupabaseServerClient } from "@/integrations/supabase/server";
import { CACHE_CONTROL_SECONDS } from "@/utils/constants";
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

	const path = `avatars/${userId}/avatar.jpg`;
	const supabase = getSupabaseServerClient();

	const { data, error } = await supabase.storage
		.from("moves-images")
		.upload(path, file, {
			cacheControl: CACHE_CONTROL_SECONDS.toString(),
			upsert: true,
		});

	if (error) {
		throw new Error("Failed to upload avatar to storage. Please try again.");
	}

	if (!data) {
		throw new Error("Failed to upload avatar to storage. Please try again.");
	}

	const { data: publicUrlData } = supabase.storage
		.from("moves-images")
		.getPublicUrl(path);

	if (!publicUrlData) {
		throw new Error("Failed to generate avatar URL. Please try again.");
	}

	return {
		avatarUrl: publicUrlData.publicUrl,
	};
}

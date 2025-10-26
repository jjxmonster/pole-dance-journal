import Replicate, { type FileOutput } from "replicate";
import { validateUserIsAdmin } from "@/data-access/profiles";
import { env } from "@/env";
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import { CACHE_CONTROL_SECONDS } from "@/utils/constants";

const replicate = new Replicate({
	auth: env.REPLICATE_API_TOKEN,
});

const recentGenerations = new Map<
	string,
	Array<{ timestamp: number; sessionId: string }>
>();

export type GenerateImageResult = {
	previewUrl: string;
	sessionId: string;
	generatedAt: Date;
};

export async function generateImageWithReplicate(
	prompt: string,
	referenceImageUrl: string
): Promise<string> {
	const supabase = getSupabaseServerClient();
	const authData = await supabase.auth.getUser();

	if (!authData.data.user) {
		throw new Error("User not authenticated");
	}
	const userId = authData.data.user.id;
	const isAdmin = await validateUserIsAdmin(userId);
	if (!isAdmin) {
		throw new Error("User is not an administrator");
	}

	const input = {
		prompt,
		image_input: [referenceImageUrl],
		output_format: "jpg",
		aspect_ratio: "5:4",
	};

	try {
		const output = await replicate.run("google/nano-banana", { input });
		const url = (output as FileOutput).url();
		const imageUrl = url.href;

		return imageUrl;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown API error";
		throw new Error(`Replicate API error: ${message}`);
	}
}

export async function uploadPreviewImage(
	imageUrl: string,
	moveId: string,
	sessionId: string
): Promise<string> {
	try {
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch generated image: ${response.statusText}`
			);
		}

		const buffer = await response.arrayBuffer();
		const filename = `${moveId}/${sessionId}.jpg`;

		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase.storage
			.from("moves-images")
			.upload(filename, buffer, {
				cacheControl: CACHE_CONTROL_SECONDS.toString(),
				upsert: false,
				contentType: "image/jpeg",
			});

		if (error) {
			throw new Error(`Storage upload failed: ${error.message}`);
		}

		if (!data) {
			throw new Error("No data returned from storage upload");
		}

		return filename;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown upload error";
		throw new Error(`Failed to upload preview image: ${message}`);
	}
}

export async function createSignedUrl(
	filePath: string,
	expirationSeconds: number
): Promise<string> {
	const supabase = getSupabaseServerClient();

	const { data, error } = await supabase.storage
		.from("moves-images")
		.createSignedUrl(filePath, expirationSeconds);

	if (error) {
		throw new Error(`Failed to create signed URL: ${error.message}`);
	}

	const hasNoData = !data;
	const hasNoSignedUrl = !data?.signedUrl;
	if (hasNoData || hasNoSignedUrl) {
		throw new Error("No signed URL returned from storage");
	}

	return data.signedUrl;
}

export function getSessionId(moveId: string): string {
	const generations = recentGenerations.get(moveId) ?? [];
	if (generations.length === 0) {
		throw new Error("No session found for move");
	}
	const lastGeneration = generations.at(-1);
	if (!lastGeneration) {
		throw new Error("No session found for move");
	}
	return lastGeneration.sessionId;
}

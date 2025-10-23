import { getSupabaseServerClient } from "@/integrations/supabase/server";
import {
	CACHE_CONTROL_SECONDS,
	HOURS_PER_DAY,
	MINUTES_PER_HOUR,
	SECONDS_PER_MINUTE,
} from "@/utils/constants";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

const IMAGE_GENERATION = {
	PROMPT_MIN_LENGTH: 10,
	PROMPT_MAX_LENGTH: 500,
	RATE_LIMIT_PER_24H: 5,
	REFERENCE_IMAGE_VALIDATION_TIMEOUT_MS: 5000,
	REFERENCE_IMAGE_MAX_SIZE_MB: 50,
	PREVIEW_IMAGE_EXPIRATION_HOURS: 24,
	REPLICATE_TIMEOUT_MS: 120_000,
	ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
	REPLICATE_VERSION:
		"e731f5e1a8e6fc5c3efcc8b5e28382212f7a4133c5b46835bc991f33d41a27ba",
	NUM_OUTPUTS: 1,
	NUM_INFERENCE_STEPS: 4,
	GUIDANCE_SCALE: 7.5,
	REPLICATE_POLLING_INTERVAL_MS: 500,
	REPLICATE_MAX_WAIT_TIME_MS: 120_000,
	BYTES_PER_MB: 1024,
} as const;

const recentGenerations = new Map<
	string,
	Array<{ timestamp: number; sessionId: string }>
>();

export type GenerateImageResult = {
	previewUrl: string;
	sessionId: string;
	generatedAt: Date;
};

async function pollReplicaStatus(
	predictionId: string,
	timeout: number
): Promise<string> {
	const pollInterval = IMAGE_GENERATION.REPLICATE_POLLING_INTERVAL_MS;

	let attempts = 0;
	const maxAttempts = timeout / pollInterval;

	while (attempts < maxAttempts) {
		await new Promise((resolve) => setTimeout(resolve, pollInterval));

		const statusResponse = await fetch(
			`https://api.replicate.com/v1/predictions/${predictionId}`,
			{
				headers: {
					Authorization: `Token ${REPLICATE_API_TOKEN}`,
				},
			}
		);

		if (!statusResponse.ok) {
			throw new Error(
				`Failed to poll Replicate API: ${statusResponse.statusText}`
			);
		}

		const statusData = (await statusResponse.json()) as {
			status: string;
			output?: string[];
			error?: string;
		};

		if (statusData.status === "succeeded" && statusData.output) {
			return statusData.output[0];
		}

		const hasFailed = statusData.status === "failed";
		if (hasFailed) {
			throw new Error(
				`Image generation failed: ${statusData.error || "Unknown error"}`
			);
		}

		attempts += 1;
	}

	throw new Error("Image generation polling timeout exceeded");
}

export async function generateImageWithReplicate(
	prompt: string,
	referenceImageUrl: string
): Promise<string> {
	if (!REPLICATE_API_TOKEN) {
		throw new Error("Replicate API token not configured");
	}

	const input = {
		prompt,
		image: referenceImageUrl,
		num_outputs: IMAGE_GENERATION.NUM_OUTPUTS,
		num_inference_steps: IMAGE_GENERATION.NUM_INFERENCE_STEPS,
		guidance_scale: IMAGE_GENERATION.GUIDANCE_SCALE,
	};

	try {
		const response = await Promise.race([
			fetch("https://api.replicate.com/v1/predictions", {
				method: "POST",
				headers: {
					Authorization: `Token ${REPLICATE_API_TOKEN}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					version: IMAGE_GENERATION.REPLICATE_VERSION,
					input,
				}),
			}),
			new Promise<Response>((_, reject) =>
				setTimeout(
					() => reject(new Error("Replicate API request timed out")),
					IMAGE_GENERATION.REPLICATE_TIMEOUT_MS
				)
			),
		]);

		if (!response.ok) {
			throw new Error(
				`Replicate API returned status ${response.status}: ${response.statusText}`
			);
		}

		const data = (await response.json()) as {
			id: string;
			status: string;
			output?: string[];
		};

		if (data.status === "succeeded" && data.output) {
			return data.output[0];
		}

		const imageUrl = await pollReplicaStatus(
			data.id,
			IMAGE_GENERATION.REPLICATE_MAX_WAIT_TIME_MS
		);
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
	expirationHours: number
): Promise<string> {
	const supabase = getSupabaseServerClient();
	const expirationSeconds =
		expirationHours * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;

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

export const IMAGE_GENERATION_CONFIG = IMAGE_GENERATION;

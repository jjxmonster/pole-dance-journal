import type { StatusOption } from "@/types/move";

export const PAGE_SIZE = 20;
export const DEBOUNCE_DELAY_MS = 250;

export const SECONDS_PER_MINUTE = 60;
export const MS_PER_SECOND = 1000;
export const MINUTES_TO_MS = SECONDS_PER_MINUTE * MS_PER_SECOND;
export const STALE_TIME_MINUTES = 5;
export const STALE_TIME_MS = STALE_TIME_MINUTES * MINUTES_TO_MS;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;
export const PLURAL_THRESHOLD = 5;
export const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_FILE_SIZE_MB = 10;
const BYTES_PER_MB = 1024;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * BYTES_PER_MB * BYTES_PER_MB; // in bytes
export const ALLOWED_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
] as const;
export const CACHE_CONTROL_SECONDS = 3600;
export const HOURS_PER_DAY = 24;
export const MINUTES_PER_HOUR = 60;
export const RANDOM_STRING_START_INDEX = 2;
export const RANDOM_STRING_END_INDEX = 11;
export const DOT_CHARACTER = ".";
export const DEFAULT_FILE_EXTENSION = "jpg";
export const BASE_36_RADIX = 36;

export const STATUS_OPTIONS: StatusOption[] = [
	{ value: "WANT", label: "Chcę zrobić" },
	{ value: "ALMOST", label: "Prawie" },
	{ value: "DONE", label: "Zrobione" },
];

export const NOTE_MAX_LENGTH = 2000;
export const NOTE_WARNING_THRESHOLD = 1900;

export const SAMPLE_USER = "6c97cd4c-bc47-45c6-b19c-7853b8eaacb2";

export const MOVE_NAME_MIN_LENGTH = 3;
export const MOVE_NAME_MAX_LENGTH = 100;
export const MOVE_DESCRIPTION_MIN_LENGTH = 10;
export const MOVE_DESCRIPTION_MAX_LENGTH = 500;
export const MOVE_STEP_TITLE_MIN_LENGTH = 3;
export const MOVE_STEP_TITLE_MAX_LENGTH = 150;
export const MOVE_STEP_DESCRIPTION_MIN_LENGTH = 10;
export const MOVE_STEP_DESCRIPTION_MAX_LENGTH = 150;
export const MOVE_STEPS_MIN_COUNT = 2;
export const MOVE_STEPS_MAX_COUNT = 15;
export const MOVE_NAME_WARNING_THRESHOLD = 90;
export const MOVE_DESCRIPTION_WARNING_THRESHOLD = 450;
export const SIGNED_URL_EXPIRATION_SECONDS = 3600;

export const LEVEL_COLORS = {
	Beginner: "bg-green-100 text-green-800 hover:bg-green-100",
	Intermediate: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
	Advanced: "bg-red-100 text-red-800 hover:bg-red-100",
} as const;

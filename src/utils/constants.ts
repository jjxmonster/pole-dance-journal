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

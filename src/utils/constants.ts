import type { StatusOption } from "@/types/move";

export const PAGE_SIZE = 20;
export const DEBOUNCE_DELAY_MS = 250;

const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MINUTES_TO_MS = SECONDS_PER_MINUTE * MS_PER_SECOND;
const STALE_TIME_MINUTES = 5;
export const STALE_TIME_MS = STALE_TIME_MINUTES * MINUTES_TO_MS;

export const PLURAL_THRESHOLD = 5;

export const STATUS_OPTIONS: StatusOption[] = [
	{ value: "WANT", label: "Chcę zrobić" },
	{ value: "ALMOST", label: "Prawie" },
	{ value: "DONE", label: "Zrobione" },
];

export const NOTE_MAX_LENGTH = 2000;
export const NOTE_WARNING_THRESHOLD = 1900;

export const SAMPLE_USER = "6c97cd4c-bc47-45c6-b19c-7853b8eaacb2";

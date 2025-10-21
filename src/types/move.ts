import type { z } from "zod";
import type { moveLevelEnum } from "../db/schema";
import type {
	MoveDetailSchema,
	MoveNoteSchema,
	MoveStepSchema,
} from "../orpc/schema";

export type MoveLevel = (typeof moveLevelEnum.enumValues)[number];

export type MoveDetailResponse = z.infer<typeof MoveDetailSchema>;

export type MoveStatus = "WANT" | "ALMOST" | "DONE";

export type StatusOption = {
	value: MoveStatus;
	label: string;
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type Step = z.infer<typeof MoveStepSchema>;

export type MoveNote = z.infer<typeof MoveNoteSchema>;

export type LocalStorageNoteBackup = {
	note: string;
	timestamp: number;
	moveId: string;
};

export type UserMoveStatusResponse = {
	status: MoveStatus;
	note: string | null;
	updatedAt: string;
};

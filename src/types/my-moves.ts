import type { z } from "zod";
import type { MyMoveItemSchema } from "../orpc/schema";

export type MyMoveDTO = z.infer<typeof MyMoveItemSchema>;

export type MoveStatus = "WANT" | "ALMOST" | "DONE";

export type MoveLevel = "Beginner" | "Intermediate" | "Advanced";

export type MyMoveViewModel = {
	id: string;
	name: string;
	level: MoveLevel;
	slug: string;
	imageUrl: string | null;
	status: MoveStatus;
	statusPolish: string;
	hasNote: boolean;
	isArchived: boolean;
};

export function mapToViewModel(dto: MyMoveDTO): MyMoveViewModel {
	const statusPolishMap: Record<MoveStatus, string> = {
		WANT: "Chcę zrobić",
		ALMOST: "Prawie",
		DONE: "Zrobione",
	};

	return {
		id: dto.id,
		name: dto.name,
		level: dto.level,
		slug: dto.slug,
		imageUrl: dto.imageUrl,
		status: dto.status,
		statusPolish: statusPolishMap[dto.status],
		hasNote: dto.note !== null && dto.note.trim().length > 0,
		isArchived: dto.isDeleted,
	};
}

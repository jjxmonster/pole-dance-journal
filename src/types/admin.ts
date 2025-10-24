export type AdminMoveStatus = "Published" | "Unpublished" | "Deleted";

export type MoveLevel = "Beginner" | "Intermediate" | "Advanced";

export type AdminListMovesInput = {
	limit?: number;
	offset?: number;
	level?: MoveLevel;
	status?: AdminMoveStatus;
	query?: string;
};

export type AdminListMovesOutput = {
	moves: {
		id: string;
		name: string;
		level: MoveLevel;
		slug: string;
		status: AdminMoveStatus;
		updatedAt: Date;
	}[];
	total: number;
};

export type AdminMoveViewModel = {
	id: string;
	name: string;
	level: MoveLevel;
	slug: string;
	status: AdminMoveStatus;
	updatedAt: Date;
};

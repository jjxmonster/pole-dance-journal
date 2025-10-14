import { getBySlug, listMoves } from "./moves";
import { set } from "./user-move-statuses";

export default {
	moves: {
		list: listMoves,
		getBySlug,
	},
	userMoveStatuses: {
		set,
	},
};

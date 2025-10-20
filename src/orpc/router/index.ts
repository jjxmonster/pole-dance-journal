import {
	forgotPassword,
	getSession,
	login,
	logout,
	oauthCallback,
	oauthStart,
	register,
	resetPassword,
} from "./auth";
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
	auth: {
		register,
		login,
		logout,
		getSession,
		forgotPassword,
		resetPassword,
		oauthStart,
		oauthCallback,
	},
};

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
import { addNote, deleteNote, getNotes } from "./move-notes";
import { getBySlug, listMoves } from "./moves";
import { get, set } from "./user-move-statuses";

export default {
	moves: {
		list: listMoves,
		getBySlug,
	},
	userMoveStatuses: {
		get,
		set,
	},
	moveNotes: {
		getNotes,
		addNote,
		deleteNote,
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

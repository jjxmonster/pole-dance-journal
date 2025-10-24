import {
	deleteMoveProcedure,
	getStatsProcedure,
	listMovesProcedure,
	publishMoveProcedure,
	restoreMoveProcedure,
	unpublishMoveProcedure,
	uploadReferenceImageProcedure,
} from "./admin";
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
import { getBySlug, getForUser, listMoves } from "./moves";
import { get, set } from "./user-move-statuses";

export default {
	moves: {
		list: listMoves,
		getBySlug,
		getForUser,
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
	admin: {
		getStats: getStatsProcedure,
		moves: {
			listMoves: listMovesProcedure,
			publishMove: publishMoveProcedure,
			unpublishMove: unpublishMoveProcedure,
			deleteMove: deleteMoveProcedure,
			restoreMove: restoreMoveProcedure,
			uploadReferenceImage: uploadReferenceImageProcedure,
		},
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

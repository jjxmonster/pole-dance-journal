import {
	acceptImageProcedure,
	createMoveProcedure,
	deleteMoveProcedure,
	editMoveProcedure,
	generateImageProcedure,
	getMoveProcedure,
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
import {
	getBySlug,
	getForUser,
	getRandomMove,
	getRandomMovesForWheel,
	listMoves,
} from "./moves";
import {
	changePassword,
	getProfile,
	updateAvatar,
	updateName,
	uploadAvatar,
} from "./profiles";
import { get, set } from "./user-move-statuses";

export default {
	moves: {
		list: listMoves,
		getBySlug,
		getForUser,
		getRandomMove,
		getRandomMovesForWheel,
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
	profiles: {
		getProfile,
		updateName,
		updateAvatar,
		uploadAvatar,
		changePassword,
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
			createMove: createMoveProcedure,
			editMove: editMoveProcedure,
			acceptImage: acceptImageProcedure,
			generateImage: generateImageProcedure,
			getMove: getMoveProcedure,
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

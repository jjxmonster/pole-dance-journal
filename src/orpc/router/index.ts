import {
	acceptImageProcedure,
	createComboProcedure,
	createMoveProcedure,
	deleteComboProcedure,
	deleteMoveProcedure,
	editMoveProcedure,
	generateImageProcedure,
	getComboProcedure,
	getMoveProcedure,
	getStatsProcedure,
	listCombosProcedure,
	listMovesProcedure,
	publishComboProcedure,
	publishMoveProcedure,
	restoreComboProcedure,
	restoreMoveProcedure,
	unpublishComboProcedure,
	unpublishMoveProcedure,
	updateComboProcedure,
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
import {
	getBySlug as getComboBySlug,
	listCombos,
	toggleFavorite as toggleComboFavorite,
} from "./combos";
import { addNote, deleteNote, getNotes } from "./move-notes";
import {
	getBySlug,
	getForUser,
	getRandomMove,
	getRandomMovesForWheel,
	listMoves,
	listMovesTrialVersion,
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
		listTrialVersion: listMovesTrialVersion,
		getBySlug,
		getForUser,
		getRandomMove,
		getRandomMovesForWheel,
	},
	combos: {
		list: listCombos,
		getBySlug: getComboBySlug,
		toggleFavorite: toggleComboFavorite,
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
		combos: {
			listCombos: listCombosProcedure,
			createCombo: createComboProcedure,
			updateCombo: updateComboProcedure,
			publishCombo: publishComboProcedure,
			unpublishCombo: unpublishComboProcedure,
			deleteCombo: deleteComboProcedure,
			restoreCombo: restoreComboProcedure,
			getCombo: getComboProcedure,
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

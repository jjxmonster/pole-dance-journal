import { ORPCError, os } from "@orpc/server";
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import { getLocale } from "@/paraglide/runtime";
import {
	getComboBySlug,
	listPublishedCombos,
	toggleComboFavorite,
} from "../../data-access/combos";
import { authMiddleware } from "../auth";
import {
	ComboFavoriteToggleInputSchema,
	ComboFavoriteToggleOutputSchema,
	ComboGetBySlugInputSchema,
	ComboGetBySlugOutputSchema,
	CombosListInputSchema,
	CombosListOutputSchema,
} from "../schema";

export const listCombos = os
	.input(CombosListInputSchema)
	.output(CombosListOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const data = await supabase.auth.getUser();
		const userId = data.data.user?.id;

		const result = await listPublishedCombos(input, userId);
		return result;
	});

export const getBySlug = os
	.input(ComboGetBySlugInputSchema)
	.output(ComboGetBySlugOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const data = await supabase.auth.getUser();
		const userId = data.data.user?.id;

		const language = (input.language ?? getLocale()) as "en" | "pl";
		const combo = await getComboBySlug(input.slug, userId, language);
		if (!combo) {
			throw new ORPCError("NOT_FOUND", {
				message: `Combo with slug "${input.slug}" not found`,
			});
		}
		return combo;
	});

export const toggleFavorite = os
	.input(ComboFavoriteToggleInputSchema)
	.output(ComboFavoriteToggleOutputSchema)
	.use(authMiddleware)
	.handler(async ({ input }) => {
		const supabase = getSupabaseServerClient();
		const data = await supabase.auth.getUser();

		if (!data.data.user) {
			throw new ORPCError("UNAUTHORIZED", {
				message: "You must be signed in to toggle favorites.",
			});
		}

		const userId = data.data.user.id;
		const result = await toggleComboFavorite(userId, input.comboId);

		return {
			success: true as const,
			isFavorite: result.isFavorite,
		};
	});

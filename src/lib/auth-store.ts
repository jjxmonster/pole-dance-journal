import { Derived, Store } from "@tanstack/store";
import type { z } from "zod";
import type { AuthSessionOutputSchema } from "@/orpc/schema";

export type AuthState = z.infer<typeof AuthSessionOutputSchema>;

const STORAGE_KEY = "auth-state";

const getInitialState = (): AuthState => {
	if (typeof window === "undefined") {
		return {
			userId: null,
			email: null,
			isAdmin: false,
			expiresAt: null,
			avatarUrl: null,
			name: null,
		};
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored) as AuthState;
			return parsed;
		}
	} catch {
		localStorage.removeItem(STORAGE_KEY);
	}

	return {
		userId: null,
		email: null,
		isAdmin: false,
		expiresAt: null,
		avatarUrl: null,
		name: null,
	};
};

export const authStore = new Store<AuthState>(getInitialState());

authStore.subscribe(() => {
	if (typeof window !== "undefined") {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(authStore.state));
	}
});

export const isAuthenticated = new Derived({
	fn: () => authStore.state.userId !== null,
	deps: [authStore],
});

export const isExpired = new Derived({
	fn: () => {
		const { expiresAt } = authStore.state;
		return expiresAt !== null && expiresAt < Date.now();
	},
	deps: [authStore],
});

isAuthenticated.mount();
isExpired.mount();

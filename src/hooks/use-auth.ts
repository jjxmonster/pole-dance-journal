import { useStore } from "@tanstack/react-store";
import type { AuthState } from "@/lib/auth-store";
import { authStore, isAuthenticated, isExpired } from "@/lib/auth-store";

export function useAuth() {
	const authState = useStore(authStore) as AuthState;
	const authenticated = useStore(isAuthenticated) as boolean;
	const expired = useStore(isExpired) as boolean;

	return {
		userId: authState.userId,
		email: authState.email,
		isAdmin: authState.isAdmin,
		expiresAt: authState.expiresAt,
		avatarUrl: authState.avatarUrl,
		name: authState.name,
		isAuthenticated: authenticated,
		isExpired: expired,
		setAuth: (state: Partial<AuthState>) => {
			authStore.setState((current) => ({
				...current,
				...state,
			}));
		},
		clearAuth: () => {
			authStore.setState({
				userId: null,
				email: null,
				isAdmin: false,
				expiresAt: null,
				avatarUrl: null,
				name: null,
			});
		},
	};
}

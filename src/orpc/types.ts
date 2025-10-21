export type SupabaseAuthUser = {
	id: string;
	email?: string;
};

export type SupabaseAuthError = {
	message: string;
};

export type SupabaseAuthSession = {
	user: SupabaseAuthUser;
	expires_at: number;
};

export type SupabaseAuthResponse<T> = {
	data: T;
	error: SupabaseAuthError | null;
};

export type SupabaseClient = {
	auth: {
		signUp: (options: {
			email: string;
			password: string;
		}) => Promise<SupabaseAuthResponse<{ user: SupabaseAuthUser }>>;
		signInWithPassword: (options: {
			email: string;
			password: string;
		}) => Promise<SupabaseAuthResponse<{ user: SupabaseAuthUser }>>;
		signOut: () => Promise<SupabaseAuthResponse<void>>;
		getSession: () => Promise<
			SupabaseAuthResponse<{ session: SupabaseAuthSession | null }>
		>;
		resetPasswordForEmail: (
			email: string,
			options?: { redirectTo: string }
		) => Promise<SupabaseAuthResponse<void>>;
		exchangeCodeForSession: (
			code: string
		) => Promise<SupabaseAuthResponse<void>>;
		updateUser: (options: {
			password: string;
		}) => Promise<SupabaseAuthResponse<void>>;
		signInWithOAuth: (options: {
			provider: string;
			options?: { redirectTo: string };
		}) => Promise<SupabaseAuthResponse<{ url: string }>>;
	};
};

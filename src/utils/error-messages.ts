import { m } from "@/paraglide/messages";

const ERROR_MESSAGE_MAP: Record<string, () => string> = {
	auth_error_email_already_registered: () =>
		m.auth_error_email_already_registered(),
	auth_error_register_failed: () => m.auth_error_register_failed(),
	auth_error_registration_failed: () => m.auth_error_registration_failed(),
	auth_error_email_not_confirmed: () => m.auth_error_email_not_confirmed(),
	auth_error_invalid_credentials: () => m.auth_error_invalid_credentials(),
	auth_error_signin_failed: () => m.auth_error_signin_failed(),
	auth_error_signout_failed: () => m.auth_error_signout_failed(),
	auth_error_oauth_start_failed: () => m.auth_error_oauth_start_failed(),
	auth_error_oauth_link_invalid: () => m.auth_error_oauth_link_invalid(),
	auth_error_user_info_failed: () => m.auth_error_user_info_failed(),
	auth_error_oauth_failed: () => m.auth_error_oauth_failed(),
	auth_error_reset_link_invalid: () => m.auth_error_reset_link_invalid(),
	auth_error_password_update_failed: () =>
		m.auth_error_password_update_failed(),
	auth_error_reset_password_failed: () => m.auth_error_reset_password_failed(),
};

export function translateErrorMessage(messageKey: string): string {
	const translator = ERROR_MESSAGE_MAP[messageKey];
	return translator ? translator() : messageKey;
}

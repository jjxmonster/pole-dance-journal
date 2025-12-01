import Cookies from "universal-cookie";
import {
	ONE_YEAR_IN_DAYS,
	TRANSITION_NOTIFICATION_COOKIE_NAME,
} from "@/utils/constants";

const cookies = new Cookies();

export function hasSeenTransitionNotification(): boolean {
	if (typeof document === "undefined") {
		return true;
	}

	return cookies.get(TRANSITION_NOTIFICATION_COOKIE_NAME) !== undefined;
}

export function markTransitionNotificationAsSeen(): void {
	if (typeof document === "undefined") {
		return;
	}

	const expiryDate = new Date();
	expiryDate.setDate(expiryDate.getDate() + ONE_YEAR_IN_DAYS);

	cookies.set(TRANSITION_NOTIFICATION_COOKIE_NAME, "true", {
		expires: expiryDate,
		path: "/",
	});
}

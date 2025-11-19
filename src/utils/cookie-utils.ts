import Cookies from "universal-cookie";
import {
	COMBO_NOTIFICATION_COOKIE_NAME,
	ONE_YEAR_IN_DAYS,
} from "@/utils/constants";

const cookies = new Cookies();

export function hasSeenComboNotification(): boolean {
	if (typeof document === "undefined") {
		return true;
	}

	return cookies.get(COMBO_NOTIFICATION_COOKIE_NAME) !== undefined;
}

export function markComboNotificationAsSeen(): void {
	if (typeof document === "undefined") {
		return;
	}

	const expiryDate = new Date();
	expiryDate.setDate(expiryDate.getDate() + ONE_YEAR_IN_DAYS);

	cookies.set(COMBO_NOTIFICATION_COOKIE_NAME, "true", {
		expires: expiryDate,
		path: "/",
	});
}

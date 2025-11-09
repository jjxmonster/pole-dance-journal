import { m } from "@/paraglide/messages";

const STATUS_MESSAGE_MAP: Record<string, () => string> = {
	move_status_want: () => m.move_status_want(),
	move_status_almost: () => m.move_status_almost(),
	move_status_done: () => m.move_status_done(),
};

export function translateStatusMessage(messageKey: string): string {
	const translator = STATUS_MESSAGE_MAP[messageKey];
	return translator ? translator() : messageKey;
}

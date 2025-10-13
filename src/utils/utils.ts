import { PLURAL_THRESHOLD } from "./constants";

export function getPluralForm(count: number): string {
	if (count === 1) {
		return "move";
	}
	if (count < PLURAL_THRESHOLD) {
		return "moves";
	}
	return "moves";
}

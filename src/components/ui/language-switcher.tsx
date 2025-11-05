import { getLocale, locales, setLocale } from "@/paraglide/runtime";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";

const LOCALE_MAP = {
	pl: "Polski",
	en: "English",
};

export function LanguageSwitcher() {
	return (
		<Select
			defaultValue={getLocale()}
			onValueChange={(value) => setLocale(value as "pl" | "en")}
		>
			<SelectTrigger>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{locales.map((locale) => (
					<SelectItem key={locale} value={locale}>
						{LOCALE_MAP[locale]} {locale === "pl" ? "🇵🇱" : "🇬🇧"}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

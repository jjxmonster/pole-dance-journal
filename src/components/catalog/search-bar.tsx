import { Search, X } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";

type SearchBarProps = {
	value: string;
	onChange: (value: string) => void;
	onClear: () => void;
};

const MAX_SEARCH_LENGTH = 100;

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
	const [localValue, setLocalValue] = useState(value);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value.slice(0, MAX_SEARCH_LENGTH);
		setLocalValue(newValue);
		onChange(newValue);
	};

	const handleClear = () => {
		setLocalValue("");
		onClear();
	};

	return (
		<div className="relative w-full">
			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Search aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
			</div>
			<Input
				aria-label="Wyszukaj ruchy pole dance"
				className="w-full py-6 pr-10 pl-10"
				data-testid="search-moves-input"
				maxLength={MAX_SEARCH_LENGTH}
				onChange={handleChange}
				placeholder="Szukaj figur..."
				type="text"
				value={localValue}
			/>
			{localValue && (
				<button
					aria-label="Wyczyść wyszukiwanie"
					className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:text-foreground"
					onClick={handleClear}
					type="button"
				>
					<X aria-hidden="true" className="h-5 w-5" />
				</button>
			)}
		</div>
	);
}

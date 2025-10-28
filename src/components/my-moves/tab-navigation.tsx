import { Button } from "../ui/button";

type MoveLevel = "Beginner" | "Intermediate" | "Advanced";

type TabNavigationProps = {
	activeTab: MoveLevel | "All";
	onTabChange: (level: MoveLevel | "All") => void;
};

const tabs: Array<{ value: MoveLevel | "All"; label: string }> = [
	{ value: "All", label: "Wszystkie" },
	{ value: "Beginner", label: "Początkujący" },
	{ value: "Intermediate", label: "Średniozaawansowany" },
	{ value: "Advanced", label: "Zaawansowany" },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
	return (
		<nav className="mb-6" data-testid="level-filters">
			<div className="flex flex-wrap gap-2">
				{tabs.map((tab) => (
					<Button
						data-testid={`filter-${tab.value.toLowerCase()}`}
						key={tab.value}
						onClick={() => {
							onTabChange(tab.value);
						}}
						type="button"
						variant={activeTab === tab.value ? "default" : "outline"}
					>
						{tab.label}
					</Button>
				))}
			</div>
		</nav>
	);
}

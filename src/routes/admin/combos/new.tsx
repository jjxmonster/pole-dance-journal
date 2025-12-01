import { createFileRoute } from "@tanstack/react-router";
import { ComboForm } from "@/components/admin/combos/combo-form";

export const Route = createFileRoute("/admin/combos/new")({
	component: CreateComboView,
});

function CreateComboView() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<header className="mb-8">
					<h1 className="font-bold text-3xl">Create New Combo</h1>
					<p className="mt-2 text-muted-foreground">
						Create a new combo set by selecting moves in the order they should
						be performed.
					</p>
				</header>

				<div className="max-w-2xl">
					<ComboForm />
				</div>
			</div>
		</div>
	);
}

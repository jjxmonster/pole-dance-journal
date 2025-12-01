import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { EditComboForm } from "@/components/admin/combos/edit-combo-form";

export const Route = createFileRoute("/admin/combos/$comboId")({
	component: EditComboView,
});

function EditComboView() {
	const { comboId } = Route.useParams();

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-4">
					<Link
						className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
						to="/admin/combos"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Combos
					</Link>
				</div>

				<header className="mb-8">
					<h1 className="font-bold text-3xl">Edit Combo</h1>
					<p className="mt-2 text-muted-foreground">
						Update the combo details and move sequence.
					</p>
				</header>

				<div className="max-w-2xl">
					<EditComboForm comboId={comboId} />
				</div>
			</div>
		</div>
	);
}

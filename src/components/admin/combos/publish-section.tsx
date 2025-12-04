import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type PublishSectionProps = {
	isPending: boolean;
	isError: boolean;
	error: Error | null;
	onPublish: () => void;
	onSaveAsDraft: () => void;
};

export function PublishSection({
	isPending,
	isError,
	error,
	onPublish,
	onSaveAsDraft,
}: PublishSectionProps) {
	return (
		<div className="border-border border-t pt-6">
			<div className="rounded-lg border border-green-200 bg-green-50 p-4">
				<h3 className="mb-2 font-semibold text-green-800">
					Combo Draft Created!
				</h3>
				<p className="mb-4 text-green-700 text-sm">
					Your combo has been saved as a draft. You can now publish it to make
					it visible to users.
				</p>

				<div className="flex gap-3">
					<Button
						className="flex-1"
						disabled={isPending}
						onClick={onPublish}
						type="button"
					>
						{isPending ? "Publishing..." : "Publish Combo"}
					</Button>
					<Button
						disabled={isPending}
						onClick={onSaveAsDraft}
						type="button"
						variant="outline"
					>
						Save as Draft
					</Button>
				</div>
			</div>

			{isError && (
				<Alert className="mt-4" variant="destructive">
					<AlertDescription>
						{error instanceof Error ? error.message : "Failed to publish combo"}
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}

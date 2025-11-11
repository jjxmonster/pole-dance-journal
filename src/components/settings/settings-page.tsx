import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/orpc/client";
import { AvatarEditor } from "./avatar-editor";
import { NameEditor } from "./name-editor";

export function SettingsPage() {
	const {
		data: profile,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ["profile"],
		queryFn: () => orpc.profiles.getProfile.call(),
	});

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<h1 className="mb-8 font-semibold text-5xl text-foreground">
					Settings
				</h1>
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-10 w-full" />
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<Skeleton className="size-32 rounded-full" />
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertDescription>
						Failed to load profile settings. Please try refreshing the page.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!profile) {
		return null;
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<h1 className="mb-8 font-semibold text-5xl text-foreground">Settings</h1>
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Name</CardTitle>
					</CardHeader>
					<CardContent>
						<NameEditor currentName={profile.name ?? ""} onUpdate={refetch} />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Avatar</CardTitle>
					</CardHeader>
					<CardContent>
						<AvatarEditor
							currentAvatarUrl={profile.avatarUrl}
							onUpdate={refetch}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

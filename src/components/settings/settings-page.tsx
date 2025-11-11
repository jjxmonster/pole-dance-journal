import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Lock, User } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";
import { AvatarEditor } from "./avatar-editor";
import { NameEditor } from "./name-editor";
import { PasswordEditor } from "./password-editor";

type TabValue = "profile" | "security" | "social" | "notifications" | "delete";

type Tab = {
	value: TabValue;
	label: string;
	icon: typeof User;
};

const tabs: Tab[] = [
	{ value: "profile", label: "Profile", icon: User },
	{ value: "security", label: "Security", icon: Lock },
];

export function SettingsPage() {
	const [activeTab, setActiveTab] = useState<TabValue>("profile");

	const {
		data: profile,
		isLoading: isLoadingProfile,
		isError: isProfileError,
		refetch,
	} = useQuery({
		queryKey: ["profile"],
		queryFn: () => orpc.profiles.getProfile.call(),
	});

	const {
		data: session,
		isLoading: isLoadingSession,
		isError: isSessionError,
	} = useQuery({
		queryKey: ["session"],
		queryFn: () => orpc.auth.getSession.call(),
	});

	const isLoading = isLoadingProfile || isLoadingSession;
	const isError = isProfileError || isSessionError;

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<div className="flex gap-8">
					<div className="w-64 space-y-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="flex-1 space-y-6">
						<Skeleton className="h-12 w-64" />
						<Skeleton className="h-32 w-full" />
					</div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertDescription>
						Failed to load settings. Please try refreshing the page.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!(profile && session)) {
		return null;
	}

	return (
		<div className="container mx-auto max-w-6xl px-4 py-8">
			<div className="flex gap-8">
				<aside className="w-64 space-y-1">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						return (
							<button
								className={cn(
									"flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm transition-colors",
									activeTab === tab.value
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
								)}
								key={tab.value}
								onClick={() => setActiveTab(tab.value)}
								type="button"
							>
								<Icon className="size-4" />
								{tab.label}
							</button>
						);
					})}
				</aside>

				<main className="flex-1">
					<h1 className="mb-8 font-semibold text-3xl">Account settings</h1>

					{activeTab === "profile" && (
						<div className="space-y-8">
							<section>
								<h2 className="mb-6 font-semibold text-2xl">Profile</h2>
								<div className="space-y-6">
									<AvatarEditor
										currentAvatarUrl={profile.avatarUrl}
										onUpdate={refetch}
									/>

									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											disabled
											id="email"
											readOnly
											type="email"
											value={session.email || ""}
										/>
										<p className="text-muted-foreground text-sm">
											Your email address cannot be changed
										</p>
									</div>

									<NameEditor
										currentName={profile.name ?? ""}
										onUpdate={refetch}
									/>
								</div>
							</section>
						</div>
					)}

					{activeTab === "security" && (
						<div className="space-y-8">
							<section>
								<h2 className="mb-6 font-semibold text-2xl">Security</h2>
								<PasswordEditor />
							</section>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}

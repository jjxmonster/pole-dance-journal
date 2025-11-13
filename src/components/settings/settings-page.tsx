import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Lock, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/orpc/client";
import { m } from "@/paraglide/messages";
import { AvatarEditor } from "./avatar-editor";
import { NameEditor } from "./name-editor";
import { PasswordEditor } from "./password-editor";

export function SettingsPage() {
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
				<div className="space-y-6">
					<Skeleton className="h-12 w-64" />
					<div className="flex gap-2">
						<Skeleton className="h-10 w-28 md:h-12 md:w-32" />
						<Skeleton className="h-10 w-28 md:h-12 md:w-32" />
					</div>
					<Skeleton className="h-32 w-full" />
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertDescription>{m.settings_error_load()}</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!(profile && session)) {
		return null;
	}

	return (
		<div className="container mx-auto max-w-6xl py-8">
			<h1 className="mb-8 font-semibold text-3xl">{m.settings_page_title()}</h1>

			<Tabs defaultValue="profile">
				<TabsList className="h-10 p-1 md:h-12">
					<TabsTrigger
						className="h-full px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground md:px-6 md:text-sm"
						value="profile"
					>
						<User className="size-4 md:size-5" />
						{m.settings_tab_profile()}
					</TabsTrigger>
					<TabsTrigger
						className="h-full px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground md:px-6 md:text-sm"
						value="security"
					>
						<Lock className="size-4 md:size-5" />
						{m.settings_tab_security()}
					</TabsTrigger>
				</TabsList>

				<TabsContent className="space-y-8" value="profile">
					<section>
						<h2 className="mb-6 font-semibold text-2xl">
							{m.settings_section_profile()}
						</h2>
						<div className="space-y-6">
							<AvatarEditor
								currentAvatarUrl={profile.avatarUrl}
								onUpdate={refetch}
							/>

							<div className="space-y-2">
								<Label htmlFor="email">{m.settings_email_label()}</Label>
								<Input
									disabled
									id="email"
									readOnly
									type="email"
									value={session.email || ""}
								/>
								<p className="text-muted-foreground text-sm">
									{m.settings_email_helper()}
								</p>
							</div>

							<NameEditor currentName={profile.name ?? ""} onUpdate={refetch} />
						</div>
					</section>
				</TabsContent>

				<TabsContent className="space-y-8" value="security">
					<section>
						<h2 className="mb-6 font-semibold text-2xl">
							{m.settings_section_security()}
						</h2>
						<PasswordEditor />
					</section>
				</TabsContent>
			</Tabs>
		</div>
	);
}

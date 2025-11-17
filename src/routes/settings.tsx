import { createFileRoute, redirect } from "@tanstack/react-router";
import { SettingsPage } from "@/components/settings/settings-page";
import { m } from "@/paraglide/messages";
import { sessionQueryOptions } from "@/query-options/auth";

export const Route = createFileRoute("/settings")({
	component: SettingsView,
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.ensureQueryData(
			sessionQueryOptions()
		);
		if (!session.userId) {
			throw redirect({
				to: "/auth/sign-in",
				search: {
					redirect: "/settings",
				},
			});
		}
	},
	head: () => ({
		meta: [
			{
				title: m.settings_meta_title(),
			},
			{
				name: "description",
				content: m.settings_meta_description(),
			},
			{
				property: "og:title",
				content: m.settings_meta_title(),
			},
			{
				property: "og:description",
				content: m.settings_meta_description(),
			},
		],
	}),
});

function SettingsView() {
	return <SettingsPage />;
}

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { orpc } from "../orpc/client";

export const Route = createFileRoute("/admin")({
	beforeLoad: async () => {
		const session = await orpc.auth.getSession.call();

		if (!session.userId) {
			throw redirect({
				to: "/auth/sign-in",
				search: {
					redirect: "/admin",
				},
			});
		}

		if (!session.isAdmin) {
			throw redirect({
				to: "/",
			});
		}
	},
	component: AdminLayout,
});

function AdminLayout() {
	return <Outlet />;
}

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/combos")({
	component: CombosLayout,
});

function CombosLayout() {
	return <Outlet />;
}

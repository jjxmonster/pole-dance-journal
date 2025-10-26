import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/hooks/use-admin-stats";

export const Route = createFileRoute("/admin/")({
	component: AdminDashboardView,
	head: () => ({
		meta: [
			{
				title: "Admin Dashboard - Spinella",
			},
			{
				name: "description",
				content:
					"Administrative dashboard for managing pole dance moves and content.",
			},
		],
	}),
});

function AdminDashboardView() {
	return <AdminDashboardPage />;
}

type AdminStatsViewModel = {
	totalMoves: number;
	publishedMoves: number;
	unpublishedMoves: number;
};

function AdminDashboardPage() {
	const { data: stats, isLoading, isError } = useAdminStats();

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<AdminHeader />
			<StatsGrid isError={isError} isLoading={isLoading} stats={stats} />
		</div>
	);
}

function AdminHeader() {
	return (
		<header className="mb-8">
			<h1 className="mb-4 font-bold text-4xl">Admin Dashboard</h1>
			<QuickActions />
		</header>
	);
}

function QuickActions() {
	return (
		<div className="flex flex-wrap gap-4">
			<Button asChild type="button" variant="default">
				<Link to="/admin/moves">
					<Settings className="mr-2 size-4" />
					Manage Moves
				</Link>
			</Button>
			<Button asChild type="button" variant="outline">
				<Link to="/admin/moves/new">
					<PlusIcon className="mr-2 size-4" />
					Create New Move
				</Link>
			</Button>
		</div>
	);
}

type StatsGridProps = {
	stats: AdminStatsViewModel | undefined;
	isLoading: boolean;
	isError: boolean;
};

function StatsGrid({ stats, isLoading, isError }: StatsGridProps) {
	if (isLoading) {
		return (
			<div className="grid gap-6 md:grid-cols-3">
				<StatsCardSkeleton />
				<StatsCardSkeleton />
				<StatsCardSkeleton />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
				<p className="text-center text-destructive">
					Failed to load statistics. Please refresh the page.
				</p>
			</div>
		);
	}

	if (!stats) {
		return null;
	}

	return (
		<div className="grid gap-6 md:grid-cols-3">
			<StatsCard label="Total Moves" value={stats.totalMoves} />
			<StatsCard label="Published Moves" value={stats.publishedMoves} />
			<StatsCard label="Unpublished Moves" value={stats.unpublishedMoves} />
		</div>
	);
}

type StatsCardProps = {
	label: string;
	value: number | string;
	icon?: React.ReactNode;
};

function StatsCard({ label, value, icon }: StatsCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-sm">{label}</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{value}</div>
			</CardContent>
		</Card>
	);
}

function StatsCardSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<Skeleton className="h-4 w-24" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-8 w-16" />
			</CardContent>
		</Card>
	);
}

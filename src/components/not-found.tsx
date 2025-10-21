import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function NotFound() {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
			<div className="space-y-6 text-center">
				<h1 className="font-bold text-6xl text-foreground">404</h1>
				<h2 className="font-semibold text-2xl text-foreground">
					Page Not Found
				</h2>
				<p className="max-w-md text-lg text-muted-foreground">
					The page you're looking for doesn't exist or has been moved. Let's get
					you back on track.
				</p>
				<Button asChild>
					<Link to="/">Return to Home</Link>
				</Button>
			</div>
		</div>
	);
}

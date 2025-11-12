import { Link } from "@tanstack/react-router";
import { m } from "../../paraglide/messages";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

export function CatalogAuthPrompt() {
	return (
		<Card className="mt-8 border-2 border-primary/20">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">{m.catalog_trial_title()}</CardTitle>
				<CardDescription className="text-base">
					{m.catalog_trial_description()}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Button asChild size="lg" variant="default">
						<Link to="/auth/sign-up">{m.catalog_trial_signup_button()}</Link>
					</Button>
					<Button asChild size="lg" variant="outline">
						<Link to="/auth/sign-in">{m.catalog_trial_signin_button()}</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

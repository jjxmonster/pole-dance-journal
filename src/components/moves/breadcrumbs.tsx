import { Link } from "@tanstack/react-router";

type BreadcrumbsProps = {
	moveName: string;
};

export function Breadcrumbs({ moveName }: BreadcrumbsProps) {
	return (
		<nav aria-label="Breadcrumb" className="mb-6">
			<ol className="flex items-center space-x-2 text-muted-foreground text-sm">
				<li>
					<Link className="hover:text-foreground" to="/catalog">
						Figury
					</Link>
				</li>
				<li>
					<span>/</span>
				</li>
				<li className="text-foreground">{moveName}</li>
			</ol>
		</nav>
	);
}

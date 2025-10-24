import {
	forwardRef,
	type HTMLAttributes,
	type TdHTMLAttributes,
	type ThHTMLAttributes,
} from "react";

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
	({ className, ...props }, ref) => (
		<div className="w-full overflow-auto">
			<table
				className={`w-full caption-bottom text-sm ${className ?? ""}`}
				ref={ref}
				{...props}
			/>
		</div>
	)
);
Table.displayName = "Table";

const TableHeader = forwardRef<
	HTMLTableSectionElement,
	HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<thead
		className={`border-b bg-muted/50 ${className ?? ""}`}
		ref={ref}
		{...props}
	/>
));
TableHeader.displayName = "TableHeader";

const TableBody = forwardRef<
	HTMLTableSectionElement,
	HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tbody
		className={`[&_tr:last-child]:border-0 ${className ?? ""}`}
		ref={ref}
		{...props}
	/>
));
TableBody.displayName = "TableBody";

const TableFooter = forwardRef<
	HTMLTableSectionElement,
	HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tfoot
		className={`border-t bg-muted/50 font-medium [&>tr]:last:border-b-0 ${className ?? ""}`}
		ref={ref}
		{...props}
	/>
));
TableFooter.displayName = "TableFooter";

const TableRow = forwardRef<
	HTMLTableRowElement,
	HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
	<tr
		className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className ?? ""}`}
		ref={ref}
		{...props}
	/>
));
TableRow.displayName = "TableRow";

const TableHead = forwardRef<
	HTMLTableCellElement,
	ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<th
		className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className ?? ""}`}
		ref={ref}
		{...props}
	/>
));
TableHead.displayName = "TableHead";

const TableCell = forwardRef<
	HTMLTableCellElement,
	TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<td
		className={`px-4 py-2 align-middle [&:has([role=checkbox])]:pr-0 ${className ?? ""}`}
		ref={ref}
		{...props}
	/>
));
TableCell.displayName = "TableCell";

export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
};

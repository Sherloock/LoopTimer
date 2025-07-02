import { cn } from "@/lib/utils";

interface StatCardProps {
	label: string;
	value: string | number;
	className?: string;
	valueClassName?: string;
}

export function StatCard({
	label,
	value,
	className = "",
	valueClassName = "",
}: StatCardProps) {
	return (
		<div className={`rounded-lg bg-secondary px-4 py-2 ${className}`}>
			<div className="text-sm text-muted-foreground">{label}</div>
			<div
				className={cn(
					"text-center font-mono text-2xl font-bold",
					valueClassName,
					"text-center",
				)}
			>
				{value}
			</div>
		</div>
	);
}

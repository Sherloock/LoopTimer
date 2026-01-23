"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FloatLabelProps {
	label: string;
	children: React.ReactNode;
	htmlFor?: string;
	className?: string;
	hasValue: boolean;
}

export function FloatLabel({
	label,
	children,
	htmlFor,
	className,
	hasValue,
}: FloatLabelProps) {
	return (
		<div className={cn("relative", className)}>
			{children}
			<Label
				htmlFor={htmlFor}
				className={cn(
					"pointer-events-none absolute left-3 top-2 z-10 origin-left -translate-y-4 scale-75 bg-background px-1 text-xs text-foreground transition-all duration-200",
					hasValue
						? "top-2 -translate-y-4 scale-75 text-xs"
						: "top-1/2 -translate-y-1/2 scale-100 text-sm text-muted-foreground",
				)}
			>
				{label}
			</Label>
		</div>
	);
}

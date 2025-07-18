import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface MinimalisticContainerProps {
	children: ReactNode;
}

export function MinimalisticContainer({
	children,
}: MinimalisticContainerProps) {
	return (
		<>
			{/* Mobile: No card, full screen layout */}
			<div className="relative flex min-h-screen flex-col md:hidden">
				<div className="relative flex flex-1 flex-col justify-center overflow-hidden px-4">
					{children}
				</div>
			</div>

			{/* Desktop: Keep card layout */}
			<Card className="relative hidden min-h-[80vh] flex-col md:flex">
				<CardContent className="relative flex flex-1 flex-col justify-center overflow-hidden pt-4">
					{children}
				</CardContent>
			</Card>
		</>
	);
}

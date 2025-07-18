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
				<div className="relative flex flex-1 flex-col justify-center overflow-hidden p-2">
					{children}
				</div>
			</div>

			{/* Desktop: Keep card layout with padding */}
			<div className="hidden p-4 md:block">
				<Card className="relative min-h-[80vh] flex-col">
					<CardContent className="relative flex flex-1 flex-col justify-center overflow-hidden p-4">
						{children}
					</CardContent>
				</Card>
			</div>
		</>
	);
}

import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

interface MinimalisticContainerProps {
	children: ReactNode;
}

export function MinimalisticContainer({
	children,
}: MinimalisticContainerProps) {
	return (
		<>
			{/* Mobile: No card, full screen layout */}
			<div className="relative flex min-h-[100dvh] flex-col md:hidden">
				<div className="relative flex flex-1 flex-col justify-start overflow-hidden px-2 pb-2 pt-0">
					{children}
				</div>
			</div>

			{/* Desktop: Keep card layout with padding */}
			<div className="!mt-0 hidden h-screen p-4 md:block">
				<Card className="relative h-full flex-col">
					<CardContent className="relative flex h-full flex-1 flex-col justify-center overflow-hidden p-4">
						{children}
					</CardContent>
				</Card>
			</div>
		</>
	);
}

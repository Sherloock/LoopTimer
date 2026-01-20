"use client";

import { TimersList } from "@/components/timers-list";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/lib/navigation";
import { ArrowLeft } from "lucide-react";

export default function TimersListPage() {
	const { goToMenu } = useNavigation();

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
			{/* Mobile: thumb-reachable back button */}
			<Button
				variant="outline"
				size="icon"
				className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-background/80 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
				onClick={goToMenu}
			>
				<ArrowLeft size={20} />
				<span className="sr-only">Back to menu</span>
			</Button>

			<div className="mx-auto w-full max-w-2xl space-y-4 p-4 pb-24 sm:p-6 md:pb-6">
				{/* Desktop: keep back button in the flow */}
				<Button
					variant="ghost"
					size="icon"
					className="-ml-2 hidden md:inline-flex"
					onClick={goToMenu}
				>
					<ArrowLeft size={20} />
					<span className="sr-only">Back to menu</span>
				</Button>
				<TimersList />
			</div>
		</div>
	);
}

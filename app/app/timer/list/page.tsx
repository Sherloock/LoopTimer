"use client";

import { TimersList } from "@/components/timers-list";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/lib/navigation";
import { ArrowLeft } from "lucide-react";

export default function TimersListPage() {
	const { goToMenu } = useNavigation();

	return (
		<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted">
			{/* Decorative background (no interaction) */}
			<div aria-hidden className="pointer-events-none absolute inset-0">
				<div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute -right-28 top-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
			</div>

			{/* Mobile: thumb-reachable back button */}
			<Button
				variant="outline"
				size="icon"
				className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-lg bg-background/80 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
				onClick={goToMenu}
			>
				<ArrowLeft size={20} />
				<span className="sr-only">Back to menu</span>
			</Button>

			<div className="relative z-10 mx-auto w-full max-w-2xl space-y-4 p-4 pb-24 sm:p-6 md:pb-6">
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

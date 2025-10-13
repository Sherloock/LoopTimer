"use client";

import { TimersList } from "@/components/timers-list";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/lib/navigation";
import { ArrowLeft } from "lucide-react";

export default function AdvancedTimerPage() {
	const { goToMenu } = useNavigation();

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
			<Button
				variant="ghost"
				size="icon"
				className="absolute right-4 top-4"
				onClick={goToMenu}
			>
				<ArrowLeft size={20} />
			</Button>
			<TimersList />
		</div>
	);
}

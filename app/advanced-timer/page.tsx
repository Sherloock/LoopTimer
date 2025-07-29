"use client";

import { TimersList } from "@/components/timers-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdvancedTimerPage() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
			<Button
				variant="ghost"
				size="icon"
				className="absolute right-4 top-4"
				onClick={() => router.push("/app")}
			>
				<ArrowLeft size={20} />
			</Button>
			<TimersList />
		</div>
	);
}

"use client";

import { AdvancedTimer } from "@/components/advanced-timer";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useTimers } from "@/hooks/use-timers";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function PlayTimerPage() {
	const searchParams = useSearchParams();
	const timerId = searchParams.get("id");
	const { data: timers } = useTimers();
	const router = useRouter();
	const [showCompletion, setShowCompletion] = useState(false);

	const loadedTimer = useMemo(() => {
		if (!timerId || !timers) return undefined;
		return timers.find((t: any) => t.id === timerId);
	}, [timerId, timers]);

	const handleExit = () => {
		router.push("/");
	};

	const handleComplete = (timerName: string) => {
		setShowCompletion(true);
	};

	const handleBack = () => {
		router.push("/");
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
			<Header />
			<main className="container mx-auto max-w-4xl px-4 py-8">
				<div className="mb-6">
					<Button variant="ghost" onClick={handleBack} className="gap-2">
						<ArrowLeft size={16} />
						Back
					</Button>
				</div>
				<AdvancedTimer
					loadedTimer={loadedTimer}
					autoStart
					onExit={handleExit}
					onComplete={handleComplete}
				/>
			</main>
		</div>
	);
}

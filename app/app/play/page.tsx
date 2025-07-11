"use client";

import { AdvancedTimer } from "@/components/advanced-timer";
import { Header } from "@/components/header";
import { useTimers } from "@/hooks/use-timers";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function PlayTimerContent() {
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
		router.push("/app");
	};

	const handleComplete = (timerName: string) => {
		setShowCompletion(true);
	};

	return (
		<main className="container mx-auto max-w-4xl px-4 py-8">
			<AdvancedTimer
				loadedTimer={loadedTimer}
				autoStart
				onExit={handleExit}
				onComplete={handleComplete}
			/>
		</main>
	);
}

export default function PlayTimerPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
			<Header />
			<Suspense
				fallback={
					<div className="container mx-auto max-w-4xl px-4 py-8">
						Loading timer...
					</div>
				}
			>
				<PlayTimerContent />
			</Suspense>
		</div>
	);
}

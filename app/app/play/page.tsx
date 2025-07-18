"use client";

import { AdvancedTimer } from "@/components/advanced-timer";
import { Header } from "@/components/header";
import { useTimers } from "@/hooks/use-timers";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

export default function PlayTimerPage() {
	const [isMinimalisticView, setIsMinimalisticView] = useState(false);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
			{!isMinimalisticView && <Header />}
			<Suspense
				fallback={
					<div className="container mx-auto max-w-4xl px-4 py-8">
						Loading timer...
					</div>
				}
			>
				<PlayTimerContent onMinimalisticViewChange={setIsMinimalisticView} />
			</Suspense>
		</div>
	);
}

function PlayTimerContent({
	onMinimalisticViewChange,
}: {
	onMinimalisticViewChange: (isMinimalistic: boolean) => void;
}) {
	const searchParams = useSearchParams();
	const timerId = searchParams.get("id");
	const { data: timers } = useTimers();
	const router = useRouter();
	const [showCompletion, setShowCompletion] = useState(false);
	const [isMinimalisticView, setIsMinimalisticView] = useState(false);

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

	const handleMinimalisticViewChange = (isMinimalistic: boolean) => {
		setIsMinimalisticView(isMinimalistic);
		onMinimalisticViewChange(isMinimalistic);
	};

	return (
		<main
			className={
				isMinimalisticView ? "" : "container mx-auto max-w-4xl px-4 py-8"
			}
		>
			<AdvancedTimer
				loadedTimer={loadedTimer}
				autoStart
				onExit={handleExit}
				onComplete={handleComplete}
				onMinimalisticViewChange={handleMinimalisticViewChange}
			/>
		</main>
	);
}

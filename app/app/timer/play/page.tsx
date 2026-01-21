"use client";

import { AdvancedTimer } from "@/components/timers/editor/advanced/advanced-timer";
import { Header } from "@/components/layout/header";
import { useTimers } from "@/hooks/use-timers";
import { useNavigation } from "@/lib/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

export default function PlayTimerPage() {
	// Initialize as minimalistic if autoStart is true to prevent flicker
	const [isMinimalisticView, setIsMinimalisticView] = useState(true);

	return (
		<div
			className={
				isMinimalisticView
					? "h-screen overflow-hidden"
					: "min-h-screen bg-gradient-to-br from-background via-background to-muted"
			}
		>
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
	onMinimalisticViewChange: (value: boolean) => void;
}) {
	const searchParams = useSearchParams();
	const timerId = searchParams.get("id");
	const autoStart = searchParams.get("autoStart") === "true";
	const { data: timers } = useTimers();
	const { goToAdvancedTimer } = useNavigation();
	const [, setShowCompletion] = useState(false);
	// Initialize as minimalistic since we have autoStart
	const [isMinimalisticView, setIsMinimalisticView] = useState(true);

	const loadedTimer = useMemo(() => {
		if (!timerId || !timers) return undefined;
		return timers.find((t: any) => t.id === timerId);
	}, [timerId, timers]);

	const handleExit = () => {
		goToAdvancedTimer();
	};

	const handleComplete = (_timerName: string) => {
		setShowCompletion(true);
	};

	const handleMinimalisticViewChange = (isMinimalistic: boolean) => {
		setIsMinimalisticView(isMinimalistic);
		onMinimalisticViewChange(isMinimalistic);
	};

	return (
		<main
			className={
				isMinimalisticView ? "" : "container mx-auto max-w-4xl px-4 pb-8"
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

"use client";

import { Header } from "@/components/layout/header";
import { TimerPlayer } from "@/components/timers/player/timer-player";
import { useTimers } from "@/hooks/use-timers";
import { useNavigation } from "@/lib/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

export default function PlayTimerPage() {
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
	const { goToTimerList } = useNavigation();
	const [isMinimalisticView, setIsMinimalisticView] = useState(true);

	const loadedTimer = useMemo(() => {
		if (!timerId || !timers) return undefined;
		return timers.find((t: { id: string }) => t.id === timerId);
	}, [timerId, timers]);

	const handleExit = () => {
		goToTimerList();
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
			<TimerPlayer
				loadedTimer={loadedTimer}
				autoStart={autoStart}
				onExit={handleExit}
				onComplete={() => {}}
				onMinimalisticViewChange={handleMinimalisticViewChange}
				onSelectTimer={goToTimerList}
			/>
		</main>
	);
}

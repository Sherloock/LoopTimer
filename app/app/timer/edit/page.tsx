"use client";

import { TimerEditor } from "@/components/timers/editor/timer-editor";
import { useTimers } from "@/hooks/use-timers";
import { useNavigation } from "@/lib/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function EditTimerContent() {
	const searchParams = useSearchParams();
	const timerId = searchParams.get("id");
	const { data: timers } = useTimers();
	const { goToTimerList } = useNavigation();

	const loadedTimer = useMemo(() => {
		if (!timerId || !timers) return undefined;
		return timers.find((t: { id: string }) => t.id === timerId);
	}, [timerId, timers]);

	const handleSaveComplete = () => {
		goToTimerList();
	};

	const handleBack = () => {
		goToTimerList();
	};

	return (
		<div className="container mx-auto max-w-4xl px-0">
			<TimerEditor
				loadedTimer={loadedTimer}
				onSaveComplete={handleSaveComplete}
				onExit={handleBack}
			/>
		</div>
	);
}

export default function EditTimerPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-1">
			<Suspense
				fallback={
					<div className="container mx-auto max-w-4xl px-0">
						Loading editor...
					</div>
				}
			>
				<EditTimerContent />
			</Suspense>
		</div>
	);
}

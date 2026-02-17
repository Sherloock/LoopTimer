"use client";

import { TimerEditor } from "@/components/timers/editor/timer-editor";
import { useTimer } from "@/hooks/use-timers";
import { useNavigation } from "@/lib/navigation";
import { useSearchParams } from "next/navigation";

export function EditTimerContent() {
	const searchParams = useSearchParams();
	const timerId = searchParams.get("id");
	const { data: loadedTimer } = useTimer(timerId);
	const { goToTimerList } = useNavigation();

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

"use client";

import { EditTimer } from "@/components/edit-timer";
import { useTimers } from "@/hooks/use-timers";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function EditTimerPage() {
	const searchParams = useSearchParams();
	const timerId = searchParams.get("id");
	const { data: timers } = useTimers();
	const router = useRouter();

	const loadedTimer = useMemo(() => {
		if (!timerId || !timers) return undefined;
		return timers.find((t: any) => t.id === timerId);
	}, [timerId, timers]);

	const handleSaveComplete = () => {
		router.push("/");
	};

	const handleBack = () => {
		router.push("/");
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-1">
			<div className="container mx-auto max-w-4xl px-1">
				<EditTimer
					loadedTimer={loadedTimer}
					onSaveComplete={handleSaveComplete}
					onExit={handleBack}
				/>
			</div>
		</div>
	);
}

"use client";

import { AdvancedTimer } from "@/components/advanced-timer";
import { useTimers } from "@/hooks/use-timers";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function EditTimerPage() {
	const searchParams = useSearchParams();
	const timerId = searchParams.get("id");
	const { data: timers } = useTimers();

	const loadedTimer = useMemo(() => {
		if (!timerId || !timers) return undefined;
		return timers.find((t: any) => t.id === timerId);
	}, [timerId, timers]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-8">
			<div className="container mx-auto max-w-4xl px-4">
				<AdvancedTimer loadedTimer={loadedTimer} />
			</div>
		</div>
	);
}

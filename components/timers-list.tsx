"use client";

import { Button } from "@/components/ui/button";
import { useTimers } from "@/hooks/use-timers";
import { formatTime } from "@/lib/timer-utils";
import { computeTotalTime } from "@/utils/compute-total-time";
import { Edit, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function TimersList() {
	const { data: timers, isLoading, isError } = useTimers();
	const router = useRouter();

	if (isLoading) return <p className="text-center">Loading timers...</p>;
	if (isError)
		return <p className="text-center text-destructive">Error loading timers</p>;

	return (
		<div className="space-y-6">
			<div className="flex justify-end">
				<Button
					variant="default"
					className="gap-2"
					onClick={() => router.push("/edit")}
				>
					<Plus size={16} /> New Timer
				</Button>
			</div>

			{(!timers || timers.length === 0) && (
				<p className="text-center">No timers yet. Create one!</p>
			)}

			{timers?.map((timer: any) => {
				const totalSeconds = computeTotalTime(timer.data.items ?? []);
				return (
					<div
						key={timer.id}
						className="flex items-center justify-between rounded-md border p-4"
					>
						<div>
							<p className="font-semibold">{timer.name}</p>
							<p className="text-sm text-muted-foreground">
								{formatTime(totalSeconds)}
							</p>
						</div>
						<Button
							variant="secondary"
							size="sm"
							className="gap-2"
							onClick={() => router.push(`/edit?id=${timer.id}`)}
						>
							<Edit size={16} /> Edit
						</Button>
					</div>
				);
			})}
		</div>
	);
}

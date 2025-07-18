"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteTimer, useSaveTimer, useTimers } from "@/hooks/use-timers";
import { formatTime } from "@/lib/timer-utils";
import { computeTotalTime } from "@/utils/compute-total-time";
import { Copy, Edit, MoreVertical, Play, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TimersList() {
	const { data: timers, isLoading, isError } = useTimers();
	const router = useRouter();
	const { mutate: deleteTimer } = useDeleteTimer();
	const { mutate: duplicateTimer } = useSaveTimer();
	const [confirmId, setConfirmId] = useState<string | null>(null);

	if (isLoading)
		return (
			<div className="space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center justify-between rounded-md border p-4"
					>
						<div className="space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-16" />
						</div>
						<div className="flex items-center gap-2">
							<Skeleton className="h-8 w-8 rounded-full" />
							<Skeleton className="h-8 w-16 rounded-md" />
						</div>
					</div>
				))}
			</div>
		);
	if (isError)
		return <p className="text-center text-destructive">Error loading timers</p>;

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<Button
					variant="default"
					className="gap-2"
					onClick={() => router.push("/app/edit")}
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

						<div className="flex items-center gap-2">
							{/* Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreVertical size={16} />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onSelect={() => router.push(`/app/edit?id=${timer.id}`)}
									>
										<Edit size={16} /> Edit
									</DropdownMenuItem>
									<DropdownMenuItem
										onSelect={() =>
											duplicateTimer({
												name: `${timer.name} (Copy)`,
												data: timer.data,
											})
										}
									>
										<Copy size={16} /> Duplicate
									</DropdownMenuItem>
									<DropdownMenuItem
										className="text-destructive"
										onSelect={() => setConfirmId(timer.id)}
									>
										<Trash2 size={16} /> Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Play */}
							<Button
								variant="default"
								size="sm"
								className="gap-2"
								onClick={() => router.push(`/app/play?id=${timer.id}`)}
							>
								<Play size={16} />
								Start
							</Button>
						</div>
					</div>
				);
			})}

			{/* Delete confirmation dialog */}
			{confirmId && (
				<Dialog open={true} onOpenChange={() => setConfirmId(null)}>
					<DialogContent title="Delete Timer?">
						<p>Are you sure you want to delete this timer?</p>
						<div className="flex justify-end gap-2 pt-4">
							<Button variant="outline" onClick={() => setConfirmId(null)}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={() => {
									deleteTimer(confirmId, {
										onSuccess: () => setConfirmId(null),
									});
								}}
							>
								Delete
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteTimer, useSaveTimer, useTimers } from "@/hooks/use-timers";
import { TIMER_LIST } from "@/lib/constants/timers";
import { useNavigation } from "@/lib/navigation";
import { formatTime } from "@/lib/timer-utils";
import { computeTotalTime, type WorkoutItem } from "@/utils/compute-total-time";
import {
	Copy,
	Edit,
	MoreVertical,
	Play,
	Plus,
	Sparkles,
	Timer,
	Trash2,
} from "lucide-react";
import { useState } from "react";

interface TimerListItem {
	id: string;
	name: string;
	data: unknown;
}

function getWorkoutItemsFromTimerData(data: unknown): WorkoutItem[] {
	const maybeItems = (data as { items?: unknown } | null)?.items;
	return Array.isArray(maybeItems) ? (maybeItems as WorkoutItem[]) : [];
}

export function TimersList() {
	const { data: timers, isLoading, isError } = useTimers();
	const { mutate: deleteTimer } = useDeleteTimer();
	const { mutate: duplicateTimer } = useSaveTimer();
	const [confirmId, setConfirmId] = useState<string | null>(null);
	const { goToEditTimer, goToPlayTimer } = useNavigation();

	const timersList = (timers as TimerListItem[] | undefined) ?? [];
	const hasTimers = timersList.length > 0;
	const subtitle = hasTimers
		? TIMER_LIST.SUBTITLE.HAS_TIMERS
		: TIMER_LIST.SUBTITLE.EMPTY;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-2">
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="neon-text text-3xl font-semibold leading-none tracking-tight sm:text-4xl">
							Timers
						</h1>
						{hasTimers && (
							<Badge
								variant="secondary"
								className="border-primary/20 bg-primary/10 text-primary"
							>
								{timersList.length}
							</Badge>
						)}
					</div>
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				</div>
				{hasTimers && (
					<Button
						variant="brand"
						className="w-full gap-2 sm:w-auto"
						onClick={() => goToEditTimer()}
					>
						<Plus size={16} />
						New timer
					</Button>
				)}
			</div>

			{/* Content */}
			{isLoading ? (
				<div className="space-y-4">
					{Array.from({ length: TIMER_LIST.SKELETON_COUNT }).map((_, i) => (
						<div
							key={i}
							className="flex items-center justify-between rounded-lg border bg-card/40 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/30"
						>
							<div className="space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-16" />
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className="h-8 w-8 rounded-lg" />
								<Skeleton className="h-8 w-16 rounded-lg" />
							</div>
						</div>
					))}
				</div>
			) : isError ? (
				<Card className="border-destructive/40 bg-destructive/5">
					<CardHeader className="pb-4">
						<CardTitle className="text-base">Couldn’t load timers</CardTitle>
						<CardDescription>Please try again in a moment.</CardDescription>
					</CardHeader>
				</Card>
			) : !hasTimers ? (
				<Card className="border-dashed bg-card/40 backdrop-blur supports-[backdrop-filter]:bg-card/30">
					<CardHeader className="pb-4">
						<div className="flex items-start gap-3">
							<div className="neon-glow mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Sparkles size={16} />
							</div>
							<div className="space-y-1">
								<CardTitle className="text-lg">
									{TIMER_LIST.EMPTY_STATE.TITLE}
								</CardTitle>
								<CardDescription>
									{TIMER_LIST.EMPTY_STATE.DESCRIPTION}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardFooter className="pt-0">
						<Button
							variant="brand"
							className="w-full gap-2 sm:w-auto"
							onClick={() => goToEditTimer()}
						>
							<Plus size={16} />
							{TIMER_LIST.EMPTY_STATE.CTA}
						</Button>
					</CardFooter>
				</Card>
			) : (
				<div className="space-y-3">
					{timersList.map((timer) => {
						const items = getWorkoutItemsFromTimerData(timer.data);
						const totalSeconds = computeTotalTime(items);
						return (
							<div
								key={timer.id}
								className="group relative overflow-hidden rounded-lg border bg-card/40 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/30 sm:p-5"
							>
								<div
									aria-hidden
									className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100"
								/>

								<div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div className="flex items-start gap-3">
										<div className="neon-glow mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
											<Timer size={16} />
										</div>

										<div className="min-w-0">
											<p className="truncate font-semibold leading-tight">
												{timer.name}
											</p>
											<div className="mt-1 flex flex-wrap items-center gap-2">
												<span className="inline-flex items-center rounded-lg bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary ring-1 ring-primary/20">
													{formatTime(totalSeconds)}
												</span>
											</div>
										</div>
									</div>

									<div className="flex items-center justify-end gap-2">
										{/* Menu */}
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-9 w-9">
													<MoreVertical size={16} />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													className="gap-2"
													onSelect={() => goToEditTimer(timer.id)}
												>
													<Edit size={16} /> Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													className="gap-2"
													onSelect={() =>
														duplicateTimer({
															name: `${timer.name}${TIMER_LIST.COPY_SUFFIX}`,
															data: timer.data,
														})
													}
												>
													<Copy size={16} /> Duplicate
												</DropdownMenuItem>
												<DropdownMenuItem
													className="gap-2 text-destructive"
													onSelect={() => setConfirmId(timer.id)}
												>
													<Trash2 size={16} /> Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>

										{/* Play */}
										<Button
											variant="brand"
											size="sm"
											className="gap-2"
											onClick={() => goToPlayTimer(timer.id)}
										>
											<Play size={16} />
											Start
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Delete confirmation dialog */}
			{confirmId && (
				<Dialog open={true} onOpenChange={() => setConfirmId(null)}>
					<DialogContent title="Delete timer?">
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

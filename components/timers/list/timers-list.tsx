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
import { type LoopGroup, type WorkoutItem } from "@/utils/compute-total-time";
import {
	Copy,
	Edit,
	MoreVertical,
	Play,
	Plus,
	Sparkles,
	Timer,
	Trash2
} from "lucide-react";
import { useState } from "react";

interface TimerListItem {
	id: string;
	name: string;
	data: unknown;
}

interface WorkoutSummary {
	totalSeconds: number;
	intervalSteps: number;
	loopGroups: number;
	maxLoops: number;
	workSeconds: number;
	restSeconds: number;
	prepareSeconds: number;
}

const TIMER_CARD_META = {
	separator: " · ",
	labels: {
		steps: "Steps",
		loops: "Loops",
		work: "Work",
		rest: "Rest",
		prepare: "Prep",
	},
} as const;

function getWorkoutItemsFromTimerData(data: unknown): WorkoutItem[] {
	const maybeItems = (data as { items?: unknown } | null)?.items;
	return Array.isArray(maybeItems) ? (maybeItems as WorkoutItem[]) : [];
}

function isLoopGroup(item: WorkoutItem): item is LoopGroup {
	return (
		typeof (item as { loops?: unknown }).loops === "number" &&
		Array.isArray((item as { items?: unknown }).items)
	);
}

function summarizeWorkoutItems(items: WorkoutItem[]): WorkoutSummary {
	const summary: WorkoutSummary = {
		totalSeconds: 0,
		intervalSteps: 0,
		loopGroups: 0,
		maxLoops: 0,
		workSeconds: 0,
		restSeconds: 0,
		prepareSeconds: 0,
	};

	const walk = (current: WorkoutItem[], multiplier: number) => {
		for (const item of current) {
			if (isLoopGroup(item)) {
				summary.loopGroups += 1;
				summary.maxLoops = Math.max(summary.maxLoops, item.loops);
				walk(item.items, multiplier * item.loops);
				continue;
			}

			summary.intervalSteps += 1;
			const seconds = item.duration * multiplier;
			summary.totalSeconds += seconds;

			switch (item.type) {
				case "work":
					summary.workSeconds += seconds;
					break;
				case "rest":
					summary.restSeconds += seconds;
					break;
				case "prepare":
					summary.prepareSeconds += seconds;
					break;
			}
		}
	};

	walk(items, 1);
	return summary;
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
						{hasTimers && (
							<Button
								variant="brand"
								size="icon"
								className="ml-auto h-8 w-8"
								onClick={() => goToEditTimer()}
								aria-label="New timer"
							>
								<Plus size={16} />
							</Button>
						)}
					</div>
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				</div>
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
							size="sm"
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
						const summary = summarizeWorkoutItems(items);
						const totalSeconds = summary.totalSeconds;
						const metaParts = [
							`${TIMER_CARD_META.labels.steps} ${summary.intervalSteps}`,
							summary.loopGroups > 0 && summary.maxLoops > 0
								? `${TIMER_CARD_META.labels.loops} ×${summary.maxLoops}`
								: null,
						].filter((p): p is string => Boolean(p));
						const breakdownParts = [
							summary.workSeconds > 0
								? `${TIMER_CARD_META.labels.work} ${formatTime(summary.workSeconds)}`
								: null,
							summary.restSeconds > 0
								? `${TIMER_CARD_META.labels.rest} ${formatTime(summary.restSeconds)}`
								: null,
							summary.prepareSeconds > 0
								? `${TIMER_CARD_META.labels.prepare} ${formatTime(summary.prepareSeconds)}`
								: null,
						].filter((p): p is string => Boolean(p));
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
									<div className="flex min-w-0 items-start gap-3">
										<div className="neon-glow mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
											<Timer size={16} />
										</div>

										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-3">
												<p className="neon-text truncate font-semibold leading-tight">
													{timer.name}
												</p>
												<Badge
													variant="secondary"
													className="shrink-0 rounded-lg border-primary/20 bg-primary/10 font-mono text-base text-primary"
												>
													{formatTime(totalSeconds)}
												</Badge>
											</div>

											<div className="mt-1 space-y-1">
												<p className="text-xs text-muted-foreground ">
													{metaParts.join(TIMER_CARD_META.separator)}
												</p>
												{breakdownParts.length > 0 && (
													<p className="text-xs text-muted-foreground hidden md:block">
														{breakdownParts.join(TIMER_CARD_META.separator)}
													</p>
												)}
											</div>
										</div>
									</div>

									<div className="flex items-center justify-end gap-2 sm:shrink-0">
										{/* Menu */}
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-9 w-9"
													aria-label="Timer actions"
												>
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
										className="h-9 gap-2 px-2 md:px-3"
										onClick={() => goToPlayTimer(timer.id)}
										aria-label="Start timer"
									>
										<Play size={16} />
										{/* <span className="hidden md:inline">Start</span> */}
										<span className="inline">Start</span>
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

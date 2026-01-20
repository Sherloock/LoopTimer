"use client";

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
import { useNavigation } from "@/lib/navigation";
import { formatTime } from "@/lib/timer-utils";
import { computeTotalTime } from "@/utils/compute-total-time";
import {
	Copy,
	Edit,
	MoreVertical,
	Play,
	Plus,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useState } from "react";

export function TimersList() {
	const { data: timers, isLoading, isError } = useTimers();
	const { mutate: deleteTimer } = useDeleteTimer();
	const { mutate: duplicateTimer } = useSaveTimer();
	const [confirmId, setConfirmId] = useState<string | null>(null);
	const { goToEditTimer, goToPlayTimer } = useNavigation();

	const hasTimers = !!timers && timers.length > 0;
	const subtitle = hasTimers
		? "Choose a timer to start."
		: "Turn minutes into momentum. Create your first timer.";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold leading-none tracking-tight">
						Timers
					</h1>
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				</div>
				{hasTimers && (
					<Button
						variant="brand"
						className="gap-2"
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
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="flex items-center justify-between rounded-md border bg-card/40 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/30"
						>
							<div className="space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-16" />
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className="h-8 w-8 rounded-lg" />
								<Skeleton className="h-8 w-16 rounded-md" />
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
								<Sparkles size={18} />
							</div>
							<div className="space-y-1">
								<CardTitle className="text-lg">No timers yet</CardTitle>
								<CardDescription>
									Create your first timer in seconds — intervals, breaks, and
									loops included.
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardFooter className="pt-0">
						<Button
							variant="brand"
							className="gap-2"
							onClick={() => goToEditTimer()}
						>
							<Plus size={16} />
							Create your first timer
						</Button>
					</CardFooter>
				</Card>
			) : (
				<div className="space-y-4">
					{timers?.map((timer: any) => {
						const totalSeconds = computeTotalTime(timer.data.items ?? []);
						return (
							<div
								key={timer.id}
								className="flex items-center justify-between rounded-md border bg-card/40 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/30"
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
												onSelect={() => goToEditTimer(timer.id)}
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
						);
					})}
				</div>
			)}

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

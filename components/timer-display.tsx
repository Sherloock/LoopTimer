"use client";

import { Badge } from "@/components/ui/badge";
import { formatTime, TimerState } from "@/lib/timer-utils";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
	timeLeft: number;
	state: TimerState;
	currentIntervalName: string;
	currentRound: number;
	totalRounds: number;
	progress: number;
	intervalType?: "workout" | "rest" | "prepare";
	showStepCounter?: boolean;
	currentStep?: number;
	totalSteps?: number;
}

export function TimerDisplay({
	timeLeft,
	state,
	currentIntervalName,
	currentRound,
	totalRounds,
	progress,
	intervalType = "workout",
	showStepCounter = false,
	currentStep,
	totalSteps,
}: TimerDisplayProps) {
	const getIntervalBadgeColor = () => {
		switch (intervalType) {
			case "prepare":
				return "bg-orange-500 hover:bg-orange-600 text-white";
			case "workout":
				return "bg-green-500 hover:bg-green-600 text-white";
			case "rest":
				return "bg-blue-500 hover:bg-blue-600 text-white";
			default:
				return "default";
		}
	};

	const getTimerDisplayColor = () => {
		switch (intervalType) {
			case "prepare":
				return "text-orange-500";
			case "workout":
				return "text-green-500";
			case "rest":
				return "text-blue-500";
			default:
				return "text-primary";
		}
	};

	const getExerciseTextColor = () => {
		switch (intervalType) {
			case "prepare":
				return "text-orange-500/70";
			case "workout":
				return "text-green-500/70";
			case "rest":
				return "text-blue-500/70";
			default:
				return "text-primary/70";
		}
	};

	const getProgressColor = () => {
		switch (intervalType) {
			case "prepare":
				return "bg-orange-500";
			case "workout":
				return "bg-green-500";
			case "rest":
				return "bg-blue-500";
			default:
				return "";
		}
	};

	return (
		<>
			{/* Mobile: 3-line layout */}
			<div className="space-y-8 text-center md:hidden">
				{/* Line 1: SET 1/1 */}
				<div className="text-2xl font-semibold text-muted-foreground">
					SET {currentRound}/{totalRounds}
				</div>

				{/* Line 2: TIMER */}
				<div
					className={cn(
						"timer-display font-mono text-9xl font-bold",
						getTimerDisplayColor(),
						state === "running" && timeLeft <= 5 && "pulse-animation",
					)}
				>
					{formatTime(timeLeft)}
				</div>

				{/* Line 3: EXERCISE NAME */}
				<div
					className={cn(
						"text-3xl font-semibold uppercase",
						getExerciseTextColor(),
					)}
				>
					{currentIntervalName}
				</div>

				{/* Progress bar */}
				<div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
					<div
						className={cn(
							"h-full transition-all duration-300",
							getProgressColor(),
						)}
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>

			{/* Desktop: Original horizontal layout */}
			<div className="hidden space-y-4 text-center md:block">
				<div className="flex items-center justify-center gap-4">
					<Badge className={cn("px-4 py-2 text-lg", getIntervalBadgeColor())}>
						{currentIntervalName}
					</Badge>
					<Badge variant="outline" className="px-4 py-2 text-lg">
						Set {currentRound}/{totalRounds}
					</Badge>
					{showStepCounter && currentStep && totalSteps && (
						<Badge variant="outline" className="px-3 py-1 text-sm">
							Step {currentStep}/{totalSteps}
						</Badge>
					)}
				</div>

				<div
					className={cn(
						"timer-display font-mono text-8xl font-bold",
						getTimerDisplayColor(),
						state === "running" && timeLeft <= 5 && "pulse-animation",
					)}
				>
					{formatTime(timeLeft)}
				</div>

				<div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
					<div
						className={cn(
							"h-full transition-all duration-300",
							getProgressColor(),
						)}
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		</>
	);
}

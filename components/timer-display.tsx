"use client";

import { formatTime, TimerState } from "@/lib/timer-utils";
import { cn } from "@/lib/utils";
import { AlarmClock, ArrowDownCircle, Coffee, Dumbbell } from "lucide-react";

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
	nextInterval?: {
		name: string;
		type: "workout" | "rest" | "prepare";
		duration: number;
	};
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
	nextInterval,
}: TimerDisplayProps) {
	const getIntervalBadgeColor = () => {
		switch (intervalType) {
			case "prepare":
				return "bg-interval-prepare text-interval-foreground hover:bg-interval-prepare/90";
			case "workout":
				return "bg-interval-workout text-interval-foreground hover:bg-interval-workout/90";
			case "rest":
				return "bg-interval-rest text-interval-foreground hover:bg-interval-rest/90";
			default:
				return "default";
		}
	};

	const getTimerDisplayColor = () => {
		switch (intervalType) {
			case "prepare":
				return "text-interval-prepare";
			case "workout":
				return "text-interval-workout";
			case "rest":
				return "text-interval-rest";
			default:
				return "text-primary";
		}
	};

	const getExerciseTextColor = () => {
		switch (intervalType) {
			case "prepare":
				return "text-interval-prepare/70";
			case "workout":
				return "text-interval-workout/70";
			case "rest":
				return "text-interval-rest/70";
			default:
				return "text-primary/70";
		}
	};

	const getProgressColor = () => {
		switch (intervalType) {
			case "prepare":
				return "bg-interval-prepare";
			case "workout":
				return "bg-interval-workout";
			case "rest":
				return "bg-interval-rest";
			default:
				return "";
		}
	};

	return (
		<>
			{/* Primary layout: Centered vertical design for all screen sizes */}
			<div className="space-y-4 text-center">
				{/* Line 1: SET X/Y - only show if there are multiple sets */}
				{totalRounds > 1 && (
					<div className="text-2xl font-semibold text-muted-foreground sm:text-3xl">
						SET {currentRound}/{totalRounds}
					</div>
				)}

				<div>
					{/* Line 2: TIMER - with extra spacing */}
					<div
						className={cn(
							"timer-display font-mono text-8xl font-bold sm:text-9xl lg:text-[12rem]",
							getTimerDisplayColor(),
							state === "running" && timeLeft <= 5 && "pulse-animation",
						)}
					>
						{formatTime(timeLeft)}
					</div>

					{/* line 3: Progress bar */}
					<div className="mx-auto h-3 w-full max-w-md overflow-hidden rounded-sm bg-secondary lg:h-4 lg:max-w-lg">
						<div
							className={cn(
								"h-full transition-all duration-300",
								getProgressColor(),
							)}
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				{/* Line 4: EXERCISE NAME - with extra spacing */}
				<div
					className={cn(
						"pt-8 text-2xl font-semibold uppercase sm:text-3xl lg:text-4xl",
						getExerciseTextColor(),
					)}
				>
					{currentIntervalName}
				</div>

				{/* Next Up section directly under exercise name */}
				{nextInterval && (
					<div className="pt-20">
						<NextUp nextInterval={nextInterval} />
					</div>
				)}
			</div>
		</>
	);
}

function NextUp({
	nextInterval,
}: {
	nextInterval: {
		name: string;
		type: "workout" | "rest" | "prepare";
		duration: number;
	};
}) {
	const getIcon = () => {
		const iconSize = 24;
		switch (nextInterval.type) {
			case "workout":
				return <Dumbbell size={iconSize} className="text-interval-workout" />;
			case "rest":
				return <Coffee size={iconSize} className="text-interval-rest" />;
			case "prepare":
				return <AlarmClock size={iconSize} className="text-interval-prepare" />;
			default:
				return (
					<ArrowDownCircle size={iconSize} className="text-muted-foreground" />
				);
		}
	};

	const getBackground = () => {
		switch (nextInterval.type) {
			case "workout":
				return "bg-interval-workout/10 border-interval-workout/35";
			case "rest":
				return "bg-interval-rest/10 border-interval-rest/35";
			case "prepare":
				return "bg-interval-prepare/10 border-interval-prepare/35";
			default:
				return "bg-secondary border-muted";
		}
	};

	return (
		<div
			className={cn(
				"mx-auto mt-4 flex w-full max-w-md items-center justify-start gap-4 rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 sm:max-w-lg lg:max-w-xl",
				getBackground(),
			)}
		>
			{/* Icon with minimal space */}
			<span className="flex size-10 flex-shrink-0 items-center justify-center">
				{getIcon()}
			</span>
			<div className="flex flex-col items-start">
				<span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
					Next Up
				</span>
				<span className="text-lg font-semibold text-foreground">
					{nextInterval.name}
				</span>
				<span className="flex items-center gap-1 text-sm text-muted-foreground">
					{formatTime(nextInterval.duration)}
				</span>
			</div>
		</div>
	);
}

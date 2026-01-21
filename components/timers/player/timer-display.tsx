"use client";

import { formatTime, TimerState } from "@/lib/timer-utils";
import { cn } from "@/lib/utils";
import { AlarmClock, ArrowDownCircle, Coffee, Dumbbell } from "lucide-react";

const SET_LINE_LABEL = "SET";
const SET_LINE_PLACEHOLDER_CURRENT_ROUND = 1;
const SET_LINE_PLACEHOLDER_TOTAL_ROUNDS = 1;

const NEXT_UP_LABEL = "Next Up";
const FINAL_NEXT_UP_TITLE = "Final interval";
const FINAL_NEXT_UP_SUBTITLE = "You're nearly there.";

const INTERVAL_CUSTOM_COLOR = {
	exerciseTextAlpha: 0.7,
	nextUpBackgroundAlpha: 0.1,
	nextUpBorderAlpha: 0.35,
} as const;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const input = hex.trim();
	if (!input.startsWith("#")) return null;

	const raw = input.slice(1);
	if (raw.length === 3) {
		const r = parseInt(raw[0] + raw[0], 16);
		const g = parseInt(raw[1] + raw[1], 16);
		const b = parseInt(raw[2] + raw[2], 16);
		return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : { r, g, b };
	}

	if (raw.length === 6 || raw.length === 8) {
		const r = parseInt(raw.slice(0, 2), 16);
		const g = parseInt(raw.slice(2, 4), 16);
		const b = parseInt(raw.slice(4, 6), 16);
		return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : { r, g, b };
	}

	return null;
}

function withAlpha(color: string, alpha: number): string {
	const rgb = hexToRgb(color);
	if (!rgb) return color;
	return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

interface TimerDisplayProps {
	timeLeft: number;
	state: TimerState;
	currentIntervalName: string;
	currentRound: number;
	totalRounds: number;
	progress: number;
	intervalType?: "workout" | "rest" | "prepare";
	intervalColor?: string;
	showStepCounter?: boolean;
	currentStep?: number;
	totalSteps?: number;
	nextInterval?: {
		name: string;
		type: "workout" | "rest" | "prepare";
		duration: number;
		color?: string;
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
	intervalColor,
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
			<div className="mx-auto w-full max-w-xl space-y-4 px-2 text-center sm:max-w-2xl">
				{/* Line 1: SET X/Y (reserve space even without sets to prevent layout shift) */}
				<div className="text-2xl font-semibold text-muted-foreground sm:text-3xl">
					{totalRounds > 1 ? (
						<>
							{SET_LINE_LABEL} {currentRound}/{totalRounds}
						</>
					) : (
						<span className="invisible" aria-hidden>
							{SET_LINE_LABEL} {SET_LINE_PLACEHOLDER_CURRENT_ROUND}/
							{SET_LINE_PLACEHOLDER_TOTAL_ROUNDS}
						</span>
					)}
				</div>

				<div>
					{/* Line 2: TIMER - with extra spacing */}
					<div
						className={cn(
							"timer-display font-mono text-8xl font-bold sm:text-9xl lg:text-[12rem]",
							getTimerDisplayColor(),
							state === "running" && timeLeft <= 5 && "pulse-animation",
						)}
						style={intervalColor ? { color: intervalColor } : undefined}
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
							style={
								intervalColor
									? { width: `${progress}%`, backgroundColor: intervalColor }
									: { width: `${progress}%` }
							}
						/>
					</div>
				</div>

				{/* Line 4: EXERCISE NAME - with extra spacing */}
				<div
					className={cn(
						"mx-auto w-full break-words pt-4 text-2xl font-semibold uppercase leading-tight line-clamp-2 sm:pt-6 sm:text-3xl lg:text-4xl",
						getExerciseTextColor(),
					)}
					style={
						intervalColor
							? {
									color: withAlpha(
										intervalColor,
										INTERVAL_CUSTOM_COLOR.exerciseTextAlpha,
									),
								}
							: undefined
					}
				>
					{currentIntervalName}
				</div>

				{/* Next Up section directly under exercise name */}
				<div className="pt-8 sm:pt-10">
					{nextInterval ? (
						<NextUp nextInterval={nextInterval} />
					) : (
						<FinalNextUpPlaceholder />
					)}
				</div>
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
		color?: string;
	};
}) {
	const customColor = nextInterval.color;
	const getIcon = () => {
		const iconSize = 24;
		switch (nextInterval.type) {
			case "workout":
				return (
					<Dumbbell
						size={iconSize}
						className="text-interval-workout"
						style={customColor ? { color: customColor } : undefined}
					/>
				);
			case "rest":
				return (
					<Coffee
						size={iconSize}
						className="text-interval-rest"
						style={customColor ? { color: customColor } : undefined}
					/>
				);
			case "prepare":
				return (
					<AlarmClock
						size={iconSize}
						className="text-interval-prepare"
						style={customColor ? { color: customColor } : undefined}
					/>
				);
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
				"mx-auto mt-4 w-full max-w-md rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 sm:max-w-lg lg:max-w-xl",
				getBackground(),
			)}
			style={
				customColor
					? {
							backgroundColor: withAlpha(
								customColor,
								INTERVAL_CUSTOM_COLOR.nextUpBackgroundAlpha,
							),
							borderColor: withAlpha(
								customColor,
								INTERVAL_CUSTOM_COLOR.nextUpBorderAlpha,
							),
						}
					: undefined
			}
		>
			<div className="grid grid-cols-2 items-center gap-4">
				{/* Left column: icon + label + duration */}
				<div className="flex min-w-0 items-center gap-3">
					<span className="flex size-10 flex-shrink-0 items-center justify-center">
						{getIcon()}
					</span>
					<div className="flex min-w-0 flex-col items-start">
						<span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
							{NEXT_UP_LABEL}
						</span>
						<span className="font-mono text-sm text-muted-foreground">
							{formatTime(nextInterval.duration)}
						</span>
					</div>
				</div>

				{/* Right column: interval name */}
				<div className="min-w-0 text-right">
					<span
						className="block w-full min-w-0 truncate text-sm font-semibold text-foreground"
						title={nextInterval.name}
					>
						{nextInterval.name}
					</span>
				</div>
			</div>
		</div>
	);
}

function FinalNextUpPlaceholder() {
	const iconSize = 24;

	return (
		<div
			className={cn(
				"mx-auto mt-4 w-full max-w-md rounded-2xl border bg-secondary p-4 shadow-lg backdrop-blur-md transition-all duration-300 sm:max-w-lg lg:max-w-xl",
			)}
		>
			<div className="grid grid-cols-2 items-center gap-4">
				{/* Left column: icon + label */}
				<div className="flex min-w-0 items-center gap-3">
					<span className="flex size-10 flex-shrink-0 items-center justify-center">
						<AlarmClock size={iconSize} className="text-muted-foreground" />
					</span>
					<div className="flex min-w-0 flex-col items-start">
						<span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
							{NEXT_UP_LABEL}
						</span>
						<span className="text-xs text-muted-foreground text-left">
							{FINAL_NEXT_UP_SUBTITLE}
						</span>
					</div>
				</div>

				{/* Right column: title */}
				<div className="min-w-0 text-right">
					<span className="block w-full min-w-0 truncate text-lg font-semibold text-foreground">
						{FINAL_NEXT_UP_TITLE}
					</span>
				</div>
			</div>
		</div>
	);
}

"use client";

import { formatTime, TimerState } from "@/lib/timer-utils";
import { cn } from "@/lib/utils";
import { TimerType } from "@/types/advanced-timer";
import { AlarmClock, ArrowDownCircle, Coffee, Dumbbell } from "lucide-react";

const SET_LINE_LABEL = "SET";
const SET_LINE_PLACEHOLDER_CURRENT_ROUND = 1;
const SET_LINE_PLACEHOLDER_TOTAL_ROUNDS = 1;

const NEXT_UP_LABEL = "Next Up";
const FINAL_NEXT_UP_TITLE = "You're nearly there.";
const FINAL_NEXT_UP_SUBTITLE = "the end...";

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
		return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)
			? null
			: { r, g, b };
	}

	if (raw.length === 6 || raw.length === 8) {
		const r = parseInt(raw.slice(0, 2), 16);
		const g = parseInt(raw.slice(2, 4), 16);
		const b = parseInt(raw.slice(4, 6), 16);
		return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)
			? null
			: { r, g, b };
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
	intervalType?: TimerType;
	intervalColor?: string;
	showStepCounter?: boolean;
	currentStep?: number;
	totalSteps?: number;
	nextIntervals?: Array<{
		name: string;
		type: TimerType;
		duration: number;
		color?: string;
	}>;
}

export function TimerDisplay({
	timeLeft,
	state,
	currentIntervalName,
	currentRound,
	totalRounds,
	progress,
	intervalType = "work",
	intervalColor,
	showStepCounter = false,
	currentStep,
	totalSteps,
	nextIntervals = [],
}: TimerDisplayProps) {
	const getIntervalBadgeColor = () => {
		switch (intervalType) {
			case "prepare":
				return "bg-interval-prepare text-interval-foreground hover:bg-interval-prepare/90";
			case "work":
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
			case "work":
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
			case "work":
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
			case "work":
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
			<div className="mx-auto w-full max-w-xl space-y-6 px-4 text-center sm:max-w-2xl sm:space-y-8 sm:px-2">
				{/* Line 1: SET X/Y (reserve space even without sets to prevent layout shift) */}
				<div className="flex min-h-12 items-center justify-center text-2xl font-semibold text-muted-foreground sm:min-h-16 sm:text-3xl">
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

				<div className="space-y-4 sm:space-y-6">
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
						"mx-auto line-clamp-2 min-h-16 w-full break-words text-2xl font-semibold uppercase leading-tight sm:min-h-20 sm:text-3xl lg:min-h-24 lg:text-4xl",
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
				<div className="pt-6 sm:pt-8">
					{nextIntervals.length > 0 ? (
						<NextUpList nextIntervals={nextIntervals} />
					) : (
						<FinalNextUpPlaceholder />
					)}
				</div>
			</div>
		</>
	);
}

type NextIntervalItem = {
	name: string;
	type: TimerType;
	duration: number;
	color?: string;
};

function NextUpList({ nextIntervals }: { nextIntervals: NextIntervalItem[] }) {
	// Show up to 2 items
	const itemsToShow = nextIntervals.slice(0, 2);
	const primaryInterval = itemsToShow[0];
	const secondaryInterval = itemsToShow[1];
	const customColor = primaryInterval.color;

	const getIconForType = (type: string, color?: string) => {
		const iconSize = 20;
		switch (type) {
			case "work":
				return (
					<Dumbbell
						size={iconSize}
						className="text-interval-workout"
						style={color ? { color } : undefined}
					/>
				);
			case "rest":
				return (
					<Coffee
						size={iconSize}
						className="text-interval-rest"
						style={color ? { color } : undefined}
					/>
				);
			case "prepare":
				return (
					<AlarmClock
						size={iconSize}
						className="text-interval-prepare"
						style={color ? { color } : undefined}
					/>
				);
			default:
				return (
					<ArrowDownCircle size={iconSize} className="text-muted-foreground" />
				);
		}
	};

	const getBackgroundForType = (type: string) => {
		switch (type) {
			case "work":
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
				"mx-auto w-full max-w-80 rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 sm:w-96",
				getBackgroundForType(primaryInterval.type),
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
			{/* Primary next interval */}
			<div className="grid grid-cols-2 items-center gap-4">
				{/* Left column: icon + label + duration */}
				<div className="flex min-w-0 items-center gap-3">
					<span className="flex size-10 flex-shrink-0 items-center justify-center">
						{getIconForType(primaryInterval.type, customColor)}
					</span>
					<div className="flex min-w-0 flex-col items-start">
						<span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
							{NEXT_UP_LABEL}
						</span>
						<span className="font-mono text-sm text-muted-foreground">
							{formatTime(primaryInterval.duration)}
						</span>
					</div>
				</div>

				{/* Right column: interval name - allows 2 lines */}
				<div className="min-w-0 text-right">
					<span
						className="line-clamp-2 block w-full min-w-0 text-sm font-semibold leading-tight text-foreground"
						title={primaryInterval.name}
					>
						{primaryInterval.name}
					</span>
				</div>
			</div>

			{/* Secondary next interval (if exists) */}
			{secondaryInterval && (
				<div className="mt-3 grid grid-cols-2 items-center gap-4 border-t border-muted-foreground/20 pt-3">
					<div className="flex min-w-0 items-center gap-3">
						<span className="flex size-10 flex-shrink-0 items-center justify-center">
							{getIconForType(secondaryInterval.type, secondaryInterval.color)}
						</span>
						<div className="flex min-w-0 flex-col items-start">
							<span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
								Then
							</span>
							<span className="font-mono text-sm text-muted-foreground/70">
								{formatTime(secondaryInterval.duration)}
							</span>
						</div>
					</div>

					<div className="min-w-0 text-right">
						<span
							className="line-clamp-2 block w-full min-w-0 text-sm font-semibold leading-tight text-muted-foreground"
							title={secondaryInterval.name}
						>
							{secondaryInterval.name}
						</span>
					</div>
				</div>
			)}
		</div>
	);
}

function FinalNextUpPlaceholder() {
	const iconSize = 20;

	return (
		<div className="mx-auto w-full max-w-80 rounded-2xl border bg-secondary p-4 shadow-lg backdrop-blur-md transition-all duration-300 sm:w-96">
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
						<span className="text-left text-sm text-muted-foreground">
							{FINAL_NEXT_UP_SUBTITLE}
						</span>
					</div>
				</div>

				{/* Right column: title */}
				<div className="min-w-0 text-right">
					<span className="block w-full min-w-0 truncate text-sm font-semibold text-foreground">
						{FINAL_NEXT_UP_TITLE}
					</span>
				</div>
			</div>
		</div>
	);
}

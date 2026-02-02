"use client";

import { formatTime, TimerState } from "@/lib/timer-utils";
import { cn } from "@/lib/utils";
import { TimerType } from "@/types/advanced-timer";
import {
	AlarmClock,
	ArrowDownCircle,
	Coffee,
	Dumbbell,
	LucideIcon,
} from "lucide-react";
import { CSSProperties, ReactNode } from "react";

const SET_LINE_LABEL = "SET";
const SET_LINE_PLACEHOLDER_CURRENT_ROUND = 1;
const SET_LINE_PLACEHOLDER_TOTAL_ROUNDS = 1;

const NEXT_UP_LABEL = "Next Up";
const FINAL_NEXT_UP_TITLE = "You're nearly there.";
const FINAL_NEXT_UP_SUBTITLE = "the end...";
const NEXT_UP_THEN_LABEL = "Then";
const NEXT_UP_ICON_SIZE = 20;

const INTERVAL_CUSTOM_COLOR = {
	exerciseTextAlpha: 0.7,
	nextUpBackgroundAlpha: 0.1,
	nextUpBorderAlpha: 0.35,
} as const;

interface IntervalTypeConfig {
	badge: string;
	display: string;
	exerciseText: string;
	progress: string;
	icon: LucideIcon;
	iconClass: string;
	background: string;
}

const INTERVAL_TYPE_CONFIG: Record<TimerType, IntervalTypeConfig> = {
	prepare: {
		badge:
			"bg-interval-prepare text-interval-foreground hover:bg-interval-prepare/90",
		display: "text-interval-prepare",
		exerciseText: "text-interval-prepare/70",
		progress: "bg-interval-prepare",
		icon: AlarmClock,
		iconClass: "text-interval-prepare",
		background: "bg-interval-prepare/10 border-interval-prepare/35",
	},
	work: {
		badge:
			"bg-interval-workout text-interval-foreground hover:bg-interval-workout/90",
		display: "text-interval-workout",
		exerciseText: "text-interval-workout/70",
		progress: "bg-interval-workout",
		icon: Dumbbell,
		iconClass: "text-interval-workout",
		background: "bg-interval-workout/10 border-interval-workout/35",
	},
	rest: {
		badge:
			"bg-interval-rest text-interval-foreground hover:bg-interval-rest/90",
		display: "text-interval-rest",
		exerciseText: "text-interval-rest/70",
		progress: "bg-interval-rest",
		icon: Coffee,
		iconClass: "text-interval-rest",
		background: "bg-interval-rest/10 border-interval-rest/35",
	},
};

const DEFAULT_INTERVAL_CONFIG: IntervalTypeConfig = {
	badge: "default",
	display: "text-primary",
	exerciseText: "text-primary/70",
	progress: "",
	icon: ArrowDownCircle,
	iconClass: "text-muted-foreground",
	background: "bg-secondary border-muted",
};

/**
 * Get interval type configuration with fallback to defaults
 */
function getIntervalConfig(type: TimerType): IntervalTypeConfig {
	return INTERVAL_TYPE_CONFIG[type] ?? DEFAULT_INTERVAL_CONFIG;
}

/**
 * Parse hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const match = hex.trim().match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i);
	if (!match) return null;

	const raw = match[1];
	const isShort = raw.length <= 4;
	const normalize = (i: number) =>
		isShort
			? parseInt(raw[i] + raw[i], 16)
			: parseInt(raw.slice(i * 2, i * 2 + 2), 16);

	const r = normalize(0);
	const g = normalize(1);
	const b = normalize(2);

	const hasInvalidChannel =
		Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b);
	return hasInvalidChannel ? null : { r, g, b };
}

/**
 * Apply alpha transparency to a hex color
 */
function withAlpha(color: string, alpha: number): string {
	const rgb = hexToRgb(color);
	if (!rgb) return color;
	return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Create style object for custom color override, or undefined for default styling
 */
function createColorStyle(
	customColor: string | undefined,
	alpha?: number,
): CSSProperties | undefined {
	if (!customColor) return undefined;
	const color =
		alpha !== undefined ? withAlpha(customColor, alpha) : customColor;
	return { color };
}

/**
 * Render interval type icon with optional custom color
 */
function IntervalIcon({
	type,
	customColor,
}: {
	type: TimerType;
	customColor?: string;
}): ReactNode {
	const config = getIntervalConfig(type);
	const Icon = config.icon;
	return (
		<Icon
			size={NEXT_UP_ICON_SIZE}
			className={config.iconClass}
			style={customColor ? { color: customColor } : undefined}
		/>
	);
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
	nextIntervals?: NextIntervalItem[];
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
	nextIntervals = [],
}: TimerDisplayProps) {
	const config = getIntervalConfig(intervalType);
	const hasMultipleRounds = totalRounds > 1;
	const isCountdownPulsing = state === "running" && timeLeft <= 5;
	const hasNextIntervals = nextIntervals.length > 0;

	return (
		<div className="mx-auto w-full max-w-xl space-y-6 px-4 text-center sm:max-w-2xl sm:space-y-8 sm:px-2">
			<SetCounter
				hasMultipleRounds={hasMultipleRounds}
				currentRound={currentRound}
				totalRounds={totalRounds}
			/>

			<div className="space-y-4 sm:space-y-6">
				<div
					className={cn(
						"timer-display font-mono text-8xl font-bold sm:text-9xl lg:text-[12rem]",
						config.display,
						isCountdownPulsing && "pulse-animation",
					)}
					style={createColorStyle(intervalColor)}
				>
					{formatTime(timeLeft)}
				</div>

				<ProgressBar
					progress={progress}
					progressClass={config.progress}
					customColor={intervalColor}
				/>
			</div>

			<div
				className={cn(
					"mx-auto line-clamp-2 min-h-16 w-full break-words text-2xl font-semibold uppercase leading-tight sm:min-h-20 sm:text-3xl lg:min-h-24 lg:text-4xl",
					config.exerciseText,
				)}
				style={createColorStyle(
					intervalColor,
					INTERVAL_CUSTOM_COLOR.exerciseTextAlpha,
				)}
			>
				{currentIntervalName}
			</div>

			<div className="pt-6 sm:pt-8">
				{hasNextIntervals ? (
					<NextUpList nextIntervals={nextIntervals} />
				) : (
					<FinalNextUpPlaceholder />
				)}
			</div>
		</div>
	);
}

/**
 * Displays SET X/Y counter or invisible placeholder for layout stability
 */
function SetCounter({
	hasMultipleRounds,
	currentRound,
	totalRounds,
}: {
	hasMultipleRounds: boolean;
	currentRound: number;
	totalRounds: number;
}) {
	return (
		<div className="flex min-h-12 items-center justify-center text-2xl font-semibold text-muted-foreground sm:min-h-16 sm:text-3xl">
			{hasMultipleRounds ? (
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
	);
}

/**
 * Progress bar with optional custom color override
 */
function ProgressBar({
	progress,
	progressClass,
	customColor,
}: {
	progress: number;
	progressClass: string;
	customColor?: string;
}) {
	const progressStyle: CSSProperties = customColor
		? { width: `${progress}%`, backgroundColor: customColor }
		: { width: `${progress}%` };

	return (
		<div className="mx-auto h-3 w-full max-w-md overflow-hidden rounded-sm bg-secondary lg:h-4 lg:max-w-lg">
			<div
				className={cn("h-full transition-all duration-300", progressClass)}
				style={progressStyle}
			/>
		</div>
	);
}

interface NextIntervalItem {
	name: string;
	type: TimerType;
	duration: number;
	color?: string;
}

const MAX_NEXT_UP_ITEMS = 2;

/**
 * Create container style for NextUp card with optional custom color
 */
function createNextUpContainerStyle(
	customColor: string | undefined,
): CSSProperties | undefined {
	if (!customColor) return undefined;
	return {
		backgroundColor: withAlpha(
			customColor,
			INTERVAL_CUSTOM_COLOR.nextUpBackgroundAlpha,
		),
		borderColor: withAlpha(
			customColor,
			INTERVAL_CUSTOM_COLOR.nextUpBorderAlpha,
		),
	};
}

function NextUpList({ nextIntervals }: { nextIntervals: NextIntervalItem[] }) {
	const itemsToShow = nextIntervals.slice(0, MAX_NEXT_UP_ITEMS);
	const primaryInterval = itemsToShow[0];
	const secondaryInterval = itemsToShow[1];
	const primaryConfig = getIntervalConfig(primaryInterval.type);

	return (
		<div
			className={cn(
				"mx-auto w-full max-w-80 rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 sm:w-96",
				primaryConfig.background,
			)}
			style={createNextUpContainerStyle(primaryInterval.color)}
		>
			<NextUpIntervalRow
				interval={primaryInterval}
				label={NEXT_UP_LABEL}
				isPrimary
			/>

			{secondaryInterval && (
				<NextUpIntervalRow
					interval={secondaryInterval}
					label={NEXT_UP_THEN_LABEL}
					isPrimary={false}
				/>
			)}
		</div>
	);
}

/**
 * Single interval row in the NextUp card
 */
function NextUpIntervalRow({
	interval,
	label,
	isPrimary,
}: {
	interval: NextIntervalItem;
	label: string;
	isPrimary: boolean;
}) {
	const textOpacityClass = isPrimary
		? "text-muted-foreground"
		: "text-muted-foreground/70";
	const nameClass = isPrimary ? "text-foreground" : "text-muted-foreground";

	const wrapperClass = isPrimary
		? "grid grid-cols-2 items-center gap-4"
		: "mt-3 grid grid-cols-2 items-center gap-4 border-t border-muted-foreground/20 pt-3";

	return (
		<div className={wrapperClass}>
			<div className="flex min-w-0 items-center gap-3">
				<span className="flex size-10 flex-shrink-0 items-center justify-center">
					<IntervalIcon type={interval.type} customColor={interval.color} />
				</span>
				<div className="flex min-w-0 flex-col items-start">
					<span
						className={cn(
							"text-xs font-medium uppercase tracking-widest",
							textOpacityClass,
						)}
					>
						{label}
					</span>
					<span className={cn("font-mono text-sm", textOpacityClass)}>
						{formatTime(interval.duration)}
					</span>
				</div>
			</div>

			<div className="min-w-0 text-right">
				<span
					className={cn(
						"line-clamp-2 block w-full min-w-0 text-sm font-semibold leading-tight",
						nameClass,
					)}
					title={interval.name}
				>
					{interval.name}
				</span>
			</div>
		</div>
	);
}

function FinalNextUpPlaceholder() {
	return (
		<div className="mx-auto w-full max-w-80 rounded-2xl border bg-secondary p-4 shadow-lg backdrop-blur-md transition-all duration-300 sm:w-96">
			<div className="grid grid-cols-2 items-center gap-4">
				<div className="flex min-w-0 items-center gap-3">
					<span className="flex size-10 flex-shrink-0 items-center justify-center">
						<AlarmClock
							size={NEXT_UP_ICON_SIZE}
							className="text-muted-foreground"
						/>
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

				<div className="min-w-0 text-right">
					<span className="block w-full min-w-0 truncate text-sm font-semibold text-foreground">
						{FINAL_NEXT_UP_TITLE}
					</span>
				</div>
			</div>
		</div>
	);
}

"use client";

import { Button } from "@/components/ui/button";
import { TimerState } from "@/lib/timer-utils";
import {
	Pause,
	Play,
	RotateCcw,
	SkipBack,
	SkipForward,
	Square,
} from "lucide-react";

interface TimerControlsProps {
	state: TimerState;
	onStart: () => void;
	onPause: () => void;
	onReset: () => void;
	onStop: () => void;
	onFastBackward?: () => void;
	onFastForward?: () => void;
	startLabel?: string;
	resetLabel?: string;
	disabled?: boolean;
	compact?: boolean;
}

export function TimerControls({
	state,
	onStart,
	onPause,
	onReset,
	onStop,
	onFastBackward,
	onFastForward,
	startLabel = "Start",
	resetLabel = "Start New Workout",
	disabled = false,
	compact = false,
}: TimerControlsProps) {
	const buttonSize = compact ? "default" : "lg";
	const iconSize = compact ? 16 : 20;

	return (
		<div className="relative z-[1500] flex flex-wrap justify-center gap-2 sm:gap-3">
			{(state === "running" || state === "paused") && onFastBackward && (
				<Button
					onClick={onFastBackward}
					variant="outline"
					size={buttonSize}
					className={compact ? "" : "gap-2"}
				>
					<SkipBack size={iconSize} />
				</Button>
			)}

			{state === "idle" && (
				<Button
					onClick={onStart}
					size={buttonSize}
					className={compact ? "gap-1" : "gap-2"}
					disabled={disabled}
				>
					<Play size={iconSize} />
					{!compact && startLabel}
					{compact && "Start"}
				</Button>
			)}

			{state === "running" && (
				<Button
					onClick={onPause}
					variant="secondary"
					size={buttonSize}
					className={compact ? "gap-1" : "gap-2"}
				>
					<Pause size={iconSize} />
					{!compact && "Pause"}
					{compact && "Pause"}
				</Button>
			)}

			{state === "paused" && (
				<>
					<Button
						onClick={onStart}
						size={buttonSize}
						className={compact ? "gap-1" : "gap-2"}
					>
						<Play size={iconSize} />
						Resume
					</Button>
					<Button
						onClick={onReset}
						variant="outline"
						size={buttonSize}
						className={compact ? "gap-1" : "gap-2"}
					>
						<RotateCcw size={iconSize} />
						Reset
					</Button>
				</>
			)}

			{(state === "running" || state === "paused") && (
				<>
					<Button
						onClick={onStop}
						variant="destructive"
						size={buttonSize}
						className={compact ? "gap-1" : "gap-2"}
					>
						<Square size={iconSize} />
						Stop
					</Button>
					{onFastForward && (
						<Button
							onClick={onFastForward}
							variant="outline"
							size={buttonSize}
							className={compact ? "" : "gap-2"}
						>
							<SkipForward size={iconSize} />
						</Button>
					)}
				</>
			)}

			{state === "completed" && (
				<Button
					onClick={onReset}
					size={buttonSize}
					className={compact ? "gap-1 text-sm" : "gap-2"}
				>
					<RotateCcw size={iconSize} />
					{compact ? "New Workout" : resetLabel}
				</Button>
			)}
		</div>
	);
}

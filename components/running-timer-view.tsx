"use client";

import { TimerDisplay } from "@/components/timer-display";
import { Button } from "@/components/ui/button";
import { getMute, setMute } from "@/lib/sound-utils";
import { formatTime, TimerState } from "@/lib/timer-utils";
import {
	Pause,
	Play,
	SkipBack,
	SkipForward,
	Square,
	Volume2,
	VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";

interface RunningTimerViewProps {
	// Timer state
	timeLeft: number;
	state: TimerState;
	currentSet: number;
	totalSets: number;
	intervalType: "workout" | "rest" | "prepare";

	// Display info
	currentIntervalName: string;
	progress: number;
	overallProgress: number;
	totalTimeRemaining: number;

	// Advanced timer specific (optional)
	showStepCounter?: boolean;
	currentStep?: number;
	totalSteps?: number;

	// Hold to exit state
	isHolding: boolean;
	holdProgress: number;

	nextInterval: {
		name: string;
		type: "workout" | "rest" | "prepare";
		duration: number;
	};

	// Callbacks
	onFastBackward: () => void;
	onFastForward: () => void;
	onHoldStart: () => void;
	onHoldEnd: () => void;
	onPlay: () => void;
	onPause: () => void;
}

export function RunningTimerView({
	timeLeft,
	state,
	currentSet,
	totalSets,
	intervalType,
	currentIntervalName,
	progress,
	overallProgress,
	totalTimeRemaining,
	showStepCounter = false,
	currentStep,
	totalSteps,
	isHolding,
	holdProgress,
	onFastBackward,
	onFastForward,
	onHoldStart,
	onHoldEnd,
	onPlay,
	onPause,
	nextInterval,
}: RunningTimerViewProps) {
	const [isMuted, setIsMuted] = useState(false);

	useEffect(() => {
		setIsMuted(getMute());
	}, []);

	const handleMuteToggle = () => {
		const newMutedState = !isMuted;
		setIsMuted(newMutedState);
		setMute(newMutedState);
	};

	return (
		<>
			{/* Progress bar with total remaining */}
			<div className="space-y-2">
				<div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
					<div
						className="h-full bg-primary transition-all duration-300"
						style={{ width: `${overallProgress}%` }}
					/>
				</div>
				<div className="flex justify-end">
					<div className="text-xs text-muted-foreground">
						Total remaining: {formatTime(totalTimeRemaining)}
					</div>
				</div>
			</div>

			{/* Timer controls header */}
			<div className="pb-2">
				<div className="flex items-center justify-between">
					<Button
						onClick={onFastBackward}
						variant="ghost"
						size="icon"
						className="h-12 w-12 transition-all duration-200 hover:bg-muted/80"
					>
						<SkipBack size={30} />
					</Button>

					<div className="relative">
						<Button
							onMouseDown={onHoldStart}
							onMouseUp={onHoldEnd}
							onMouseLeave={onHoldEnd}
							onTouchStart={onHoldStart}
							onTouchEnd={onHoldEnd}
							variant="ghost"
							className="relative overflow-hidden rounded-lg border-2 border-muted-foreground/20 px-6 py-3 text-sm font-medium transition-all duration-200 hover:border-muted-foreground/40 hover:bg-muted/80"
						>
							<div
								className="absolute inset-0 bg-destructive/20 transition-all duration-100 ease-out"
								style={{ width: `${holdProgress}%` }}
							/>
							<span className="relative z-10 flex items-center gap-2">
								<Square
									size={16}
									className={holdProgress > 0 ? "animate-pulse" : ""}
								/>
								<span className={holdProgress > 0 ? "animate-pulse" : ""}>
									Hold to Exit
								</span>
							</span>
						</Button>
					</div>

					<Button
						onClick={onFastForward}
						variant="ghost"
						size="icon"
						className="h-12 w-12 transition-all duration-200 hover:bg-muted/80"
					>
						<SkipForward size={30} />
					</Button>
				</div>
			</div>

			{/* Sound controls */}
			<div className="pb-4">
				<div className="flex items-center justify-center">
					<Button
						onClick={handleMuteToggle}
						variant="ghost"
						size="icon"
						className="h-10 w-10 transition-all duration-200 hover:bg-muted/80"
					>
						{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
					</Button>
				</div>
			</div>

			{/* Main timer display - perfectly centered */}
			<div className="flex flex-1 items-center justify-center">
				<TimerDisplay
					timeLeft={timeLeft}
					state={state}
					currentIntervalName={currentIntervalName}
					currentRound={currentSet}
					totalRounds={totalSets}
					progress={progress}
					intervalType={intervalType}
					showStepCounter={showStepCounter}
					currentStep={currentStep}
					totalSteps={totalSteps}
					nextInterval={nextInterval}
				/>
			</div>

			{/* Play/Pause button in bottom right corner */}
			<div className="absolute bottom-6 right-6">
				{state === "running" ? (
					<Button
						onClick={onPause}
						variant="ghost"
						size="icon"
						className="h-12 w-12 rounded-full transition-all duration-200 hover:bg-muted/80"
					>
						<Pause size={30} />
					</Button>
				) : (
					<Button
						onClick={onPlay}
						variant="ghost"
						size="icon"
						className="h-12 w-12 rounded-full transition-all duration-200 hover:bg-muted/80"
					>
						<Play size={30} />
					</Button>
				)}
			</div>
		</>
	);
}

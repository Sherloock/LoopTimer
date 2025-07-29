"use client";

import { TimerDisplay } from "@/components/timer-display";
import { Button } from "@/components/ui/button";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { getMute, setMute } from "@/lib/sound-utils";
import { formatTime, TimerState } from "@/lib/timer-utils";
import {
	Maximize2,
	Minimize2,
	Pause,
	Play,
	SkipBack,
	SkipForward,
	Square,
	Volume2,
	VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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

	nextInterval:
		| {
				name: string;
				type: "workout" | "rest" | "prepare";
				duration: number;
		  }
		| undefined;

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
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [escHoldStartTime, setEscHoldStartTime] = useState<number | null>(null);

	// Keep the screen awake while the timer is running (mobile support)
	useWakeLock(state === "running");

	// Handle fullscreen changes
	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(
				!!document.fullscreenElement ||
					!!document.webkitFullscreenElement ||
					!!document.mozFullScreenElement,
			);
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
		document.addEventListener("mozfullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
			document.removeEventListener(
				"webkitfullscreenchange",
				handleFullscreenChange,
			);
			document.removeEventListener(
				"mozfullscreenchange",
				handleFullscreenChange,
			);
		};
	}, []);

	const toggleFullscreen = useCallback(async () => {
		try {
			if (
				!document.fullscreenElement &&
				!document.webkitFullscreenElement &&
				!document.mozFullScreenElement
			) {
				// Request fullscreen
				const element = document.documentElement;
				if (element.requestFullscreen) {
					await element.requestFullscreen();
				} else if (element.webkitRequestFullscreen) {
					await element.webkitRequestFullscreen();
				} else if (element.mozRequestFullScreen) {
					await element.mozRequestFullScreen();
				}
			} else {
				// Exit fullscreen
				if (document.exitFullscreen) {
					await document.exitFullscreen();
				} else if (document.webkitExitFullscreen) {
					await document.webkitExitFullscreen();
				} else if (document.mozCancelFullScreen) {
					await document.mozCancelFullScreen();
				}
			}
		} catch (error) {
			console.error("Error toggling fullscreen:", error);
		}
	}, []);

	useEffect(() => {
		setIsMuted(getMute());
	}, []);

	const handleMuteToggle = useCallback(() => {
		const newMutedState = !isMuted;
		setIsMuted(newMutedState);
		setMute(newMutedState);
	}, [isMuted]);

	// Handle keyboard controls
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Prevent default behavior for these keys
			if (
				["Space", "ArrowLeft", "ArrowRight", "Escape", "KeyM", "KeyF"].includes(
					e.code,
				)
			) {
				e.preventDefault();
			}

			switch (e.code) {
				case "Space":
					state === "running" ? onPause() : onPlay();
					break;
				case "ArrowLeft":
					onFastBackward();
					break;
				case "ArrowRight":
					onFastForward();
					break;
				case "KeyM":
					handleMuteToggle();
					break;
				case "KeyF":
					toggleFullscreen();
					break;
				case "Escape":
					if (!escHoldStartTime) {
						setEscHoldStartTime(Date.now());
						onHoldStart();
					}
					break;
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.code === "Escape") {
				setEscHoldStartTime(null);
				onHoldEnd();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [
		state,
		onPlay,
		onPause,
		onFastBackward,
		onFastForward,
		handleMuteToggle,
		toggleFullscreen,
		onHoldStart,
		onHoldEnd,
		escHoldStartTime,
	]);

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
			<div className="pb-2 pt-2">
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

			{/* Sound and fullscreen controls */}
			<div className="pb-4">
				<div className="flex items-center justify-center gap-2">
					<Button
						onClick={handleMuteToggle}
						variant="ghost"
						size="icon"
						className="h-10 w-10 transition-all duration-200 hover:bg-muted/80"
					>
						{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
					</Button>
					<Button
						onClick={toggleFullscreen}
						variant="ghost"
						size="icon"
						className="h-10 w-10 transition-all duration-200 hover:bg-muted/80"
					>
						{isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
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

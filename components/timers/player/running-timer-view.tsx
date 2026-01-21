"use client";

import { TimerDisplay } from "@/components/timers/player/timer-display";
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
import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface RunningTimerViewProps {
	// Timer state
	timeLeft: number;
	state: TimerState;
	currentSet: number;
	totalSets: number;
	intervalType: "workout" | "rest" | "prepare";
	intervalColor?: string;

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
				color?: string;
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
	intervalColor,
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
	const escHoldStartTimeRef = useRef<number | null>(null);

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
					// Prevent auto-repeat from starting multiple hold timers
					if (!escHoldStartTimeRef.current) {
						escHoldStartTimeRef.current = Date.now();
						onHoldStart();
					}
					break;
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.code === "Escape") {
				escHoldStartTimeRef.current = null;
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
	]);

	const handleHoldPointerDown = useCallback(
		(e: ReactPointerEvent<HTMLButtonElement>) => {
			// Only respond to primary button / primary touch contact
			if (e.button !== 0) return;
			e.preventDefault();
			e.currentTarget.setPointerCapture?.(e.pointerId);
			onHoldStart();
		},
		[onHoldStart],
	);

	const handleHoldPointerEnd = useCallback(
		(e?: ReactPointerEvent<HTMLButtonElement>) => {
			e?.preventDefault();
			onHoldEnd();
		},
		[onHoldEnd],
	);

	return (
		<>
			{/* Progress bar with total remaining and fullscreen button */}
			<div className="flex items-center gap-4">
				<div className="flex-1 space-y-1">
					<div className="h-2 w-full overflow-hidden rounded-lg bg-secondary">
						<div
							className="h-full bg-primary transition-all duration-300"
							style={{ width: `${overallProgress}%` }}
						/>
					</div>
					<div className="text-xs text-muted-foreground">
						Total remaining: {formatTime(totalTimeRemaining)}
					</div>
				</div>
				<Button
					onClick={toggleFullscreen}
					variant="ghost"
					size="icon"
					className="h-10 w-10 flex-shrink-0 transition-all duration-200 hover:bg-muted/80"
				>
					{isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
				</Button>
			</div>

			{/* Timer controls header */}
			<div className="pb-2 pt-2">
				<div className="flex items-center justify-center gap-4 md:gap-8 lg:gap-12">
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
							onPointerDown={handleHoldPointerDown}
							onPointerUp={handleHoldPointerEnd}
							onPointerLeave={handleHoldPointerEnd}
							onPointerCancel={handleHoldPointerEnd}
							onLostPointerCapture={handleHoldPointerEnd}
							onContextMenu={(e) => e.preventDefault()}
							variant="ghost"
							className={`relative overflow-hidden rounded-lg border-2 px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted/80 ${
								holdProgress > 0
									? "border-primary/50 text-primary hover:border-primary/60"
									: "border-muted-foreground/20 hover:border-muted-foreground/40"
							}`}
						>
							<div
								className="absolute inset-0 bg-primary/20 transition-all duration-100 ease-out"
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
				</div>
			</div>

			{/* Main timer display - perfectly centered */}
			<div className="flex flex-1 items-center justify-center">
				<div className="-translate-y-4 sm:-translate-y-6">
					<TimerDisplay
						timeLeft={timeLeft}
						state={state}
						currentIntervalName={currentIntervalName}
						currentRound={currentSet}
						totalRounds={totalSets}
						progress={progress}
						intervalType={intervalType}
						intervalColor={intervalColor}
						showStepCounter={showStepCounter}
						currentStep={currentStep}
						totalSteps={totalSteps}
						nextInterval={nextInterval}
					/>
				</div>
			</div>

			{/* Play/Pause button in bottom right corner */}
			<div className="absolute bottom-6 right-6 md:bottom-8 md:left-1/2 md:right-auto md:-translate-x-1/2">
				{state === "running" ? (
					<Button
						onClick={onPause}
						variant="ghost"
						className="flex items-center gap-2 rounded-lg px-4 py-3 transition-all duration-200 hover:bg-muted/80 md:px-6"
					>
						<Pause size={24} />
						<span className="hidden text-sm font-medium md:inline">PAUSE</span>
					</Button>
				) : (
					<Button
						onClick={onPlay}
						variant="ghost"
						className="flex items-center gap-2 rounded-lg px-4 py-3 transition-all duration-200 hover:bg-muted/80 md:px-6"
					>
						<Play size={24} />
						<span className="hidden text-sm font-medium md:inline">PLAY</span>
					</Button>
				)}
			</div>
		</>
	);
}

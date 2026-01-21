import { TimerState, timerToasts } from "@/lib/timer-utils";
import { useRef, useState } from "react";

const HOLD_EXIT_DURATION_MS = 1000;
const HOLD_PROGRESS_MAX = 100;
const HOLD_PROGRESS_TICK_MS = 50;

export function useTimerState() {
	const [state, setState] = useState<TimerState>("idle");
	const [currentSet, setCurrentSet] = useState(1);
	const [isHolding, setIsHolding] = useState(false);
	const [holdProgress, setHoldProgress] = useState(0);
	const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const clearHoldTimers = () => {
		if (holdTimeoutRef.current) {
			clearTimeout(holdTimeoutRef.current);
			holdTimeoutRef.current = null;
		}
		if (holdIntervalRef.current) {
			clearInterval(holdIntervalRef.current);
			holdIntervalRef.current = null;
		}
	};

	const startTimer = (message?: string) => {
		setState("running");
		timerToasts.start(message);
		// Dispatch event to parent
		window.dispatchEvent(
			new CustomEvent("timerStateChange", { detail: { isRunning: true } }),
		);
	};

	const pauseTimer = () => {
		setState("paused");
		timerToasts.pause();
		// Keep running state for UI purposes
		window.dispatchEvent(
			new CustomEvent("timerStateChange", { detail: { isRunning: true } }),
		);
	};

	const resetTimer = (resetStateFn: () => void) => {
		setState("idle");
		resetStateFn();
		timerToasts.reset();
		// Dispatch event to parent
		window.dispatchEvent(
			new CustomEvent("timerStateChange", { detail: { isRunning: false } }),
		);
	};

	const stopTimer = (resetStateFn: () => void) => {
		setState("idle");
		resetStateFn();
		timerToasts.stop();
		// Dispatch event to parent
		window.dispatchEvent(
			new CustomEvent("timerStateChange", { detail: { isRunning: false } }),
		);
	};

	const handleHoldStart = (onComplete: () => void) => {
		// Defensive: prevent multiple concurrent hold timers (e.g. touch + mouse)
		if (holdTimeoutRef.current || holdIntervalRef.current) return;

		setIsHolding(true);
		setHoldProgress(0);

		const holdStart = Date.now();

		// Progress animation (time-based to avoid drift)
		holdIntervalRef.current = setInterval(() => {
			const elapsedMs = Date.now() - holdStart;
			const nextProgress = Math.min(
				HOLD_PROGRESS_MAX,
				(elapsedMs / HOLD_EXIT_DURATION_MS) * HOLD_PROGRESS_MAX,
			);
			setHoldProgress(nextProgress);

			if (elapsedMs >= HOLD_EXIT_DURATION_MS) {
				if (holdIntervalRef.current) {
					clearInterval(holdIntervalRef.current);
					holdIntervalRef.current = null;
				}
			}
		}, HOLD_PROGRESS_TICK_MS);

		// Actual exit after hold duration
		holdTimeoutRef.current = setTimeout(() => {
			try {
				onComplete();
			} finally {
				clearHoldTimers();
				setIsHolding(false);
				setHoldProgress(0);
			}
		}, HOLD_EXIT_DURATION_MS);
	};

	const handleHoldEnd = () => {
		clearHoldTimers();
		setIsHolding(false);
		setHoldProgress(0);
	};

	const setCompleted = (message?: string) => {
		setState("completed");
		timerToasts.complete(message || "🎉 Workout Complete! Great job!");
	};

	return {
		state,
		setState,
		currentSet,
		setCurrentSet,
		isHolding,
		holdProgress,
		startTimer,
		pauseTimer,
		resetTimer,
		stopTimer,
		handleHoldStart,
		handleHoldEnd,
		setCompleted,
	};
}

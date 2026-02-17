import {
	HOLD_EXIT_DURATION_MS,
	HOLD_PROGRESS_MAX,
	HOLD_PROGRESS_TICK_MS,
} from "@/lib/constants/timers";
import { CUSTOM_EVENTS } from "@/lib/constants/custom-events";
import { TimerState, timerToasts } from "@/lib/timer-utils";
import { useRef, useState } from "react";

export function useTimerState() {
	const [state, setState] = useState<TimerState>("idle");
	const [currentSet, setCurrentSet] = useState(1);
	const [isHolding, setIsHolding] = useState(false);
	const [holdProgress, setHoldProgress] = useState(0);
	const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const clearHoldTimers = () => {
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
			new CustomEvent(CUSTOM_EVENTS.TIMER_STATE_CHANGE, {
				detail: { isRunning: true },
			}),
		);
	};

	const pauseTimer = () => {
		setState("paused");
		timerToasts.pause();
		// Keep running state for UI purposes
		window.dispatchEvent(
			new CustomEvent(CUSTOM_EVENTS.TIMER_STATE_CHANGE, {
				detail: { isRunning: true },
			}),
		);
	};

	const resetTimer = (resetStateFn: () => void) => {
		setState("idle");
		resetStateFn();
		timerToasts.reset();
		// Dispatch event to parent
		window.dispatchEvent(
			new CustomEvent(CUSTOM_EVENTS.TIMER_STATE_CHANGE, {
				detail: { isRunning: false },
			}),
		);
	};

	const stopTimer = (resetStateFn: () => void) => {
		setState("idle");
		resetStateFn();
		timerToasts.stop();
		// Dispatch event to parent
		window.dispatchEvent(
			new CustomEvent(CUSTOM_EVENTS.TIMER_STATE_CHANGE, {
				detail: { isRunning: false },
			}),
		);
	};

	const handleHoldStart = (onComplete: () => void) => {
		// Defensive: prevent multiple concurrent hold timers (e.g. touch + mouse)
		if (holdIntervalRef.current) return;

		setIsHolding(true);
		setHoldProgress(0);

		const holdStart = Date.now();

		// Progress animation and exit in same tick when duration reached (no "hold after 100%")
		holdIntervalRef.current = setInterval(() => {
			const elapsedMs = Date.now() - holdStart;
			const nextProgress = Math.min(
				HOLD_PROGRESS_MAX,
				(elapsedMs / HOLD_EXIT_DURATION_MS) * HOLD_PROGRESS_MAX,
			);
			setHoldProgress(nextProgress);

			if (elapsedMs >= HOLD_EXIT_DURATION_MS) {
				clearHoldTimers();
				setIsHolding(false);
				onComplete();
			}
		}, HOLD_PROGRESS_TICK_MS);
	};

	const handleHoldEnd = () => {
		clearHoldTimers();
		setIsHolding(false);
		setHoldProgress(0);
	};

	const setCompleted = (message?: string) => {
		setState("completed");
		timerToasts.complete(message || "Workout complete. Great job.");
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

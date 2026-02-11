"use client";

import { playSound, speakText, stopAllSounds } from "@/lib/sound-utils";
import type { FlattenedInterval } from "@/lib/timer-tree/flatten";
import { timerToasts } from "@/lib/timer-utils";
import type { LoadedTimer, TimerType } from "@/types/advanced-timer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseAdvancedTimerPlaybackParams {
	flattenedIntervals: FlattenedInterval[];
	state: "idle" | "running" | "paused" | "completed";
	setCurrentSet: (n: number) => void;
	baseStartTimer: (message: string) => void;
	timerDefaultAlarm: string;
	timerIsSpeakNames: boolean;
	timerName: string;
	loadedTimer?: LoadedTimer;
	autoStart: boolean;
	onComplete?: (timerName: string) => void;
	setCompleted: (message: string) => void;
}

export interface UseAdvancedTimerPlaybackResult {
	timeLeft: number;
	currentItemIndex: number;
	currentType: TimerType;
	currentInterval: FlattenedInterval | null;
	resetState: () => void;
	fastForward: () => void;
	fastBackward: () => void;
	handleTimerComplete: () => void;
}

export function useAdvancedTimerPlayback({
	flattenedIntervals,
	state,
	setCurrentSet,
	baseStartTimer,
	timerDefaultAlarm,
	timerIsSpeakNames,
	timerName,
	loadedTimer,
	autoStart,
	onComplete,
	setCompleted,
}: UseAdvancedTimerPlaybackParams): UseAdvancedTimerPlaybackResult {
	const [currentType, setCurrentType] = useState<TimerType>("prepare");
	const [timeLeft, setTimeLeft] = useState(0);
	const [currentItemIndex, setCurrentItemIndex] = useState(0);
	const playedSecondsRef = useRef<Set<number>>(new Set());

	// Refs for stable reads inside callbacks without adding deps
	const timeLeftRef = useRef(timeLeft);
	timeLeftRef.current = timeLeft;
	const currentItemIndexRef = useRef(currentItemIndex);
	currentItemIndexRef.current = currentItemIndex;

	const resetState = useCallback(() => {
		setCurrentSet(1);
		setCurrentItemIndex(0);
		if (flattenedIntervals.length > 0) {
			setTimeLeft(flattenedIntervals[0].duration);
			setCurrentType(flattenedIntervals[0].type);
		}
	}, [setCurrentSet, flattenedIntervals]);

	const handleTimerComplete = useCallback(() => {
		setCurrentItemIndex((prevIndex) => {
			const nextIndex = prevIndex + 1;

			if (nextIndex < flattenedIntervals.length) {
				const nextInterval = flattenedIntervals[nextIndex];
				if (nextInterval.sound) {
					playSound(nextInterval.sound);
				}
				setCurrentType(nextInterval.type);
				setTimeLeft(nextInterval.duration);

				const intervalName = nextInterval.loopInfo
					? `${nextInterval.loopInfo.iteration} - ${nextInterval.name}`
					: nextInterval.name;

				timerToasts.nextInterval(intervalName);
				return nextIndex;
			}

			stopAllSounds();
			playSound(timerDefaultAlarm);
			setCompleted("🎉 Advanced Workout Complete! Great job!");
			onComplete?.(timerName || "Timer");
			return prevIndex;
		});
	}, [
		flattenedIntervals,
		setCompleted,
		timerDefaultAlarm,
		timerName,
		onComplete,
	]);

	const fastForward = useCallback(() => {
		setCurrentItemIndex((prevIndex) => {
			if (prevIndex < flattenedIntervals.length - 1) {
				const nextIndex = prevIndex + 1;
				const nextInterval = flattenedIntervals[nextIndex];
				setCurrentType(nextInterval.type);
				setTimeLeft(nextInterval.duration);
				return nextIndex;
			}
			if (
				flattenedIntervals.length > 0 &&
				prevIndex === flattenedIntervals.length - 1
			) {
				handleTimerComplete();
			}
			return prevIndex;
		});
	}, [flattenedIntervals, handleTimerComplete]);

	const fastBackward = useCallback(() => {
		if (flattenedIntervals.length === 0) return;
		const idx = currentItemIndexRef.current;
		const current = flattenedIntervals[idx];
		if (!current) return;

		// If not at the start of the current interval, restart it
		if (timeLeftRef.current < current.duration) {
			setTimeLeft(current.duration);
			return;
		}

		// Already at the start — jump to previous interval (if any)
		if (idx > 0) {
			const prevIndex = idx - 1;
			const prevInterval = flattenedIntervals[prevIndex];
			setCurrentItemIndex(prevIndex);
			setCurrentType(prevInterval.type);
			setTimeLeft(prevInterval.duration);
		}
	}, [flattenedIntervals]);

	const currentInterval = useMemo(() => {
		if (
			flattenedIntervals.length === 0 ||
			currentItemIndex >= flattenedIntervals.length
		) {
			return null;
		}
		return flattenedIntervals[currentItemIndex];
	}, [flattenedIntervals, currentItemIndex]);

	// Initialize timer when idle
	useEffect(() => {
		if (state === "idle" && flattenedIntervals.length > 0) {
			setTimeLeft(flattenedIntervals[0].duration);
			setCurrentType(flattenedIntervals[0].type);
			setCurrentItemIndex(0);
		}
		if (state === "idle") {
			setCurrentSet(1);
		}
	}, [state, flattenedIntervals, setCurrentSet]);

	// Timer countdown
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (state === "running" && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((prev) => prev - 1);
			}, 1000);
		} else if (state === "running" && timeLeft === 0) {
			handleTimerComplete();
		}

		return () => clearInterval(interval);
	}, [state, timeLeft, handleTimerComplete]);

	// Clear played seconds when current interval changes
	useEffect(() => {
		playedSecondsRef.current.clear();
	}, [currentInterval]);

	// Pre-compute beep config from alarm string (avoid recomputing on every tick)
	const beepConfig = useMemo(() => {
		const category = timerDefaultAlarm.replace(/-\d+x$/, "");
		const variant = timerDefaultAlarm.match(/-(\d+x)$/)?.[1] || "1x";
		let beepCount = 1;
		if (variant === "2x") beepCount = 2;
		else if (variant === "3x") beepCount = 3;
		return { category, beepCount };
	}, [timerDefaultAlarm]);

	// Countdown beep logic (3-2-1)
	useEffect(() => {
		if (state !== "running") return;
		if (!currentInterval) return;

		const isOutsideBeepRange =
			timeLeft < 1 || timeLeft > 3 || timeLeft > beepConfig.beepCount;
		if (isOutsideBeepRange) return;
		if (playedSecondsRef.current.has(timeLeft)) return;

		playedSecondsRef.current.add(timeLeft);
		playSound(`${beepConfig.category}-short`);
	}, [state, timeLeft, currentInterval, beepConfig]);

	// Speak interval names
	useEffect(() => {
		const shouldSpeakCurrentInterval =
			timerIsSpeakNames &&
			state === "running" &&
			flattenedIntervals.length > 0 &&
			currentItemIndex < flattenedIntervals.length;
		if (!shouldSpeakCurrentInterval) return;

		const interval = flattenedIntervals[currentItemIndex];
		speakText(interval.name);
	}, [state, currentItemIndex, flattenedIntervals, timerIsSpeakNames]);

	// Auto-start
	useEffect(() => {
		const shouldAutoStartWhenLoadedAndIdle =
			Boolean(autoStart) &&
			Boolean(loadedTimer) &&
			state === "idle" &&
			flattenedIntervals.length > 0;
		if (!shouldAutoStartWhenLoadedAndIdle) return;

		const timer = setTimeout(() => {
			baseStartTimer("Timer started!");
		}, 100);
		return () => clearTimeout(timer);
	}, [autoStart, loadedTimer, state, flattenedIntervals, baseStartTimer]);

	return {
		timeLeft,
		currentItemIndex,
		currentType,
		currentInterval,
		resetState,
		fastForward,
		fastBackward,
		handleTimerComplete,
	};
}

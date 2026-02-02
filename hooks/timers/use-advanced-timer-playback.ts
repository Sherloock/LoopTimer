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

	const resetState = useCallback(() => {
		setCurrentSet(1);
		setCurrentItemIndex(0);
	}, [setCurrentSet]);

	const handleTimerComplete = useCallback(() => {
		const nextIndex = currentItemIndex + 1;

		if (nextIndex < flattenedIntervals.length) {
			const nextIntervalPreview = flattenedIntervals[nextIndex];
			if (nextIntervalPreview.sound) {
				playSound(nextIntervalPreview.sound);
			}
			const nextInterval = flattenedIntervals[nextIndex];
			setCurrentItemIndex(nextIndex);
			setCurrentType(nextInterval.type);
			setTimeLeft(nextInterval.duration);

			const intervalName = nextInterval.loopInfo
				? `${nextInterval.loopInfo.iteration} - ${nextInterval.name}`
				: nextInterval.name;

			timerToasts.nextInterval(intervalName);
		} else {
			stopAllSounds();
			playSound(timerDefaultAlarm);
			setCompleted("🎉 Advanced Workout Complete! Great job!");
			onComplete?.(timerName || "Timer");
		}
	}, [
		currentItemIndex,
		flattenedIntervals,
		setCompleted,
		timerDefaultAlarm,
		timerName,
		onComplete,
	]);

	const fastForward = useCallback(() => {
		if (currentItemIndex < flattenedIntervals.length - 1) {
			const nextIndex = currentItemIndex + 1;
			const nextInterval = flattenedIntervals[nextIndex];
			setCurrentItemIndex(nextIndex);
			setCurrentType(nextInterval.type);
			setTimeLeft(nextInterval.duration);
		}
	}, [currentItemIndex, flattenedIntervals]);

	const fastBackward = useCallback(() => {
		if (currentItemIndex > 0) {
			const prevIndex = currentItemIndex - 1;
			const prevInterval = flattenedIntervals[prevIndex];
			setCurrentItemIndex(prevIndex);
			setCurrentType(prevInterval.type);
			setTimeLeft(prevInterval.duration);
		} else if (flattenedIntervals.length > 0) {
			setTimeLeft(flattenedIntervals[0].duration);
		}
	}, [currentItemIndex, flattenedIntervals]);

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

	// Countdown beep logic (3-2-1)
	useEffect(() => {
		if (state !== "running") return;
		if (!currentInterval) return;

		const category = timerDefaultAlarm.replace(/-\d+x$/, "");
		const variant = timerDefaultAlarm.match(/-(\d+x)$/)?.[1] || "1x";

		let beepCount = 1;
		if (variant === "2x") beepCount = 2;
		else if (variant === "3x") beepCount = 3;

		const isOutsideBeepRange =
			timeLeft < 1 || timeLeft > 3 || timeLeft > beepCount;
		if (isOutsideBeepRange) return;
		if (playedSecondsRef.current.has(timeLeft)) return;

		playedSecondsRef.current.add(timeLeft);
		playSound(`${category}-short`);
	}, [state, timeLeft, currentInterval, timerDefaultAlarm]);

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

"use client";

import { MinimalisticContainer } from "@/components/timers/player/minimalistic-container";
import { RunningTimerView } from "@/components/timers/player/running-timer-view";
import { TimerCompletionScreen } from "@/components/timers/player/timer-completion-screen";
import { useAdvancedTimerPlayback } from "@/hooks/timers/use-advanced-timer-playback";
import { useFlattenedIntervals } from "@/hooks/timers/use-flattened-intervals";
import { useTimerState } from "@/hooks/use-timer-state";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { ADVANCED_TIMER_DEFAULT_COLORS } from "@/lib/constants/timers";
import { setMute } from "@/lib/sound-utils";
import { getProgress } from "@/lib/timer-utils";
import type {
	AdvancedConfig,
	LoadedTimer,
	LoopGroup,
	TimerType,
	WorkoutItem,
} from "@/types/advanced-timer";
import { isLoop } from "@/types/advanced-timer";
import { useCallback, useEffect, useMemo } from "react";

function getTimerColors(loadedTimer?: LoadedTimer | null) {
	return loadedTimer?.colors ?? ADVANCED_TIMER_DEFAULT_COLORS;
}

function getTimerDisplaySettings(loadedTimer?: LoadedTimer | null) {
	return {
		timerName: loadedTimer?.name ?? "Timer",
		timerDefaultAlarm: loadedTimer?.defaultAlarm ?? "default",
		timerIsSpeakNames: loadedTimer?.isSpeakNames ?? true,
		timerColors: getTimerColors(loadedTimer),
	};
}

export interface TimerPlayerProps {
	loadedTimer?: LoadedTimer;
	autoStart?: boolean;
	onExit?: () => void;
	onComplete?: (timerName: string) => void;
	onMinimalisticViewChange?: (isMinimalistic: boolean) => void;
	onSelectTimer?: () => void;
}

export function TimerPlayer({
	loadedTimer,
	autoStart = false,
	onExit,
	onComplete,
	onMinimalisticViewChange,
	onSelectTimer,
}: TimerPlayerProps) {
	const { data: userPreferences } = useUserPreferences();
	const displaySettings = useMemo(
		() => getTimerDisplaySettings(loadedTimer),
		[loadedTimer],
	);

	const config: AdvancedConfig = useMemo(
		() => ({
			items: (loadedTimer?.data as AdvancedConfig)?.items ?? [],
		}),
		[loadedTimer],
	);

	const flattenedIntervals = useFlattenedIntervals(config.items);

	const {
		state,
		setCurrentSet,
		isHolding,
		holdProgress,
		startTimer: baseStartTimer,
		pauseTimer,
		resetTimer: baseResetTimer,
		stopTimer: baseStopTimer,
		handleHoldStart: baseHoldStart,
		handleHoldEnd,
		setCompleted,
	} = useTimerState();

	const playback = useAdvancedTimerPlayback({
		flattenedIntervals,
		state,
		setCurrentSet,
		baseStartTimer,
		timerDefaultAlarm: displaySettings.timerDefaultAlarm,
		timerIsSpeakNames: displaySettings.timerIsSpeakNames,
		timerName: displaySettings.timerName,
		loadedTimer,
		autoStart,
		onComplete,
		setCompleted,
	});

	const {
		timeLeft,
		currentItemIndex,
		currentType,
		currentInterval,
		resetState,
		fastForward,
		fastBackward,
	} = playback;

	const startTimer = useCallback(() => {
		if (userPreferences && !userPreferences.isSound) {
			setMute(true);
		}
		baseStartTimer("Timer started!");
	}, [baseStartTimer, userPreferences]);

	const resetTimer = useCallback(
		() => baseResetTimer(resetState),
		[baseResetTimer, resetState],
	);

	const stopTimer = useCallback(
		() => baseStopTimer(resetState),
		[baseStopTimer, resetState],
	);

	const handleHoldStart = useCallback(
		() => baseHoldStart(() => onExit?.()),
		[baseHoldStart, onExit],
	);

	const timerColors = displaySettings.timerColors;
	const currentIntervalColor = useMemo(() => {
		if (!currentInterval) return undefined;
		return currentInterval.color ?? timerColors[currentInterval.type];
	}, [currentInterval, timerColors]);

	const totalSessionTime = useMemo(() => {
		if (flattenedIntervals.length === 0) return 0;
		return flattenedIntervals.reduce(
			(sum, interval) => sum + interval.duration,
			0,
		);
	}, [flattenedIntervals]);

	const overallProgress = useMemo(() => {
		if (state === "idle" || state === "completed") return 0;
		const totalIntervals = flattenedIntervals.length;
		if (totalIntervals === 0) return 0;

		const hasCurrentInterval =
			flattenedIntervals.length > 0 &&
			currentItemIndex < flattenedIntervals.length;
		const currentIntervalProgress = hasCurrentInterval
			? getProgress(flattenedIntervals[currentItemIndex].duration, timeLeft) /
				100
			: 0;

		return Math.min(
			100,
			((currentItemIndex + currentIntervalProgress) / totalIntervals) * 100,
		);
	}, [state, flattenedIntervals, currentItemIndex, timeLeft]);

	const totalTimeRemaining = useMemo(() => {
		if (state === "idle" || state === "completed") return 0;
		let remaining = timeLeft;
		for (let i = currentItemIndex + 1; i < flattenedIntervals.length; i++) {
			remaining += flattenedIntervals[i].duration;
		}
		return remaining;
	}, [state, timeLeft, currentItemIndex, flattenedIntervals]);

	const nextIntervals = useMemo(() => {
		const result: Array<{
			name: string;
			type: TimerType;
			duration: number;
			color?: string;
		}> = [];
		for (let i = 1; i <= 2; i++) {
			const nextIndex = currentItemIndex + i;
			if (nextIndex < flattenedIntervals.length) {
				const next = flattenedIntervals[nextIndex];
				result.push({
					name: next.name,
					type: next.type,
					duration: next.duration,
					color: next.color ?? timerColors[next.type],
				});
			}
		}
		return result;
	}, [currentItemIndex, flattenedIntervals, timerColors]);

	const { currentLoopSet, totalLoopSets } = useMemo(() => {
		if (!currentInterval?.loopInfo) {
			return { currentLoopSet: 1, totalLoopSets: 1 };
		}

		let rootLoopInfo = currentInterval.loopInfo;
		while (rootLoopInfo.parentLoop) {
			rootLoopInfo = rootLoopInfo.parentLoop as typeof rootLoopInfo;
		}

		const findLoopItem = (items: WorkoutItem[]): LoopGroup | null => {
			for (const item of items) {
				if (isLoop(item)) return item;
			}
			return null;
		};

		const loopItem = findLoopItem(config.items);
		return {
			currentLoopSet: rootLoopInfo.iteration,
			totalLoopSets: loopItem?.loops ?? 1,
		};
	}, [currentInterval, config.items]);

	const isCompletionView = state === "completed";
	const isMinimalisticView = state === "running" || state === "paused";

	useEffect(() => {
		onMinimalisticViewChange?.(isMinimalisticView);
	}, [isMinimalisticView, onMinimalisticViewChange]);

	const getCurrentIntervalName = useCallback(() => {
		if (!currentInterval) return "PREPARE";
		return currentInterval.name;
	}, [currentInterval]);

	const getTimerProgress = useCallback(() => {
		if (!currentInterval) return 0;
		return getProgress(currentInterval.duration, timeLeft);
	}, [currentInterval, timeLeft]);

	// No timer loaded or no intervals: show select-timer state
	if (!loadedTimer || flattenedIntervals.length === 0) {
		return (
			<div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-8 text-center">
				<p className="text-muted-foreground">Select a timer to play.</p>
				{onSelectTimer && (
					<button
						type="button"
						onClick={onSelectTimer}
						className="text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
					>
						Go to timer list
					</button>
				)}
			</div>
		);
	}

	return (
		<div className="relative">
			{isCompletionView && (
				<div className="fixed inset-0 flex items-center justify-center bg-background">
					<TimerCompletionScreen
						onBack={() => onExit?.()}
						onAgain={() => {
							resetTimer();
							startTimer();
						}}
						timerName={displaySettings.timerName}
					/>
				</div>
			)}

			{isMinimalisticView && !isCompletionView && (
				<MinimalisticContainer>
					<RunningTimerView
						timeLeft={timeLeft}
						state={state}
						currentSet={currentLoopSet}
						totalSets={totalLoopSets}
						intervalType={currentType}
						intervalColor={currentIntervalColor}
						currentIntervalName={getCurrentIntervalName()}
						progress={getTimerProgress()}
						overallProgress={overallProgress}
						totalTimeRemaining={totalTimeRemaining}
						currentStep={currentItemIndex + 1}
						totalSteps={flattenedIntervals.length}
						isHolding={isHolding}
						holdProgress={holdProgress}
						onFastBackward={fastBackward}
						onFastForward={fastForward}
						onHoldStart={handleHoldStart}
						onHoldEnd={handleHoldEnd}
						onPlay={startTimer}
						onPause={pauseTimer}
						nextIntervals={nextIntervals}
					/>
				</MinimalisticContainer>
			)}
		</div>
	);
}

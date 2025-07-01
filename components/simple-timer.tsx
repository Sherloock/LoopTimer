"use client";

import { MinimalisticContainer } from "@/components/minimalistic-container";
import { MinimalisticTimerView } from "@/components/minimalistic-timer-view";
import { TimerControls } from "@/components/timer-controls";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { StatCard } from "@/components/ui/stat-card";
import { TimeInput } from "@/components/ui/time-input";
import { useTimerState } from "@/hooks/use-timer-state";
import { formatTime, getProgress, timerToasts } from "@/lib/timer-utils";
import { TimerType, getIntervalTypeForDisplay } from "@/utils/timer-shared";
import { useEffect, useState } from "react";

interface SimpleTimerConfig {
	workoutTime: number;
	restTime: number;
	sets: number;
	workoutName: string;
}

export function SimpleTimer() {
	const [config, setConfig] = useState<SimpleTimerConfig>({
		workoutTime: 45,
		restTime: 15,
		sets: 8,
		workoutName: "WORK",
	});

	const [currentType, setCurrentType] = useState<TimerType>("prepare");
	const [timeLeft, setTimeLeft] = useState(0);

	const {
		state,
		currentSet,
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

	// Initialize timer
	useEffect(() => {
		if (state === "idle") {
			setTimeLeft(5); // Start with 5-second prepare
			setCurrentType("prepare");
			setCurrentSet(1);
		}
	}, [config, state, setCurrentSet]);

	// Timer countdown logic
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
	}, [state, timeLeft]);

	const handleTimerComplete = () => {
		if (currentType === "prepare") {
			// Move from prepare to first workout
			setCurrentType("workout");
			setTimeLeft(config.workoutTime);
			timerToasts.nextInterval("Let's go! Start working!");
		} else if (currentType === "workout") {
			if (config.restTime > 0) {
				setCurrentType("rest");
				setTimeLeft(config.restTime);
				timerToasts.restTime();
			} else {
				// Skip rest if rest time is 0
				if (currentSet < config.sets) {
					setTimeLeft(config.workoutTime);
					setCurrentSet((prev) => prev + 1);
					timerToasts.nextRound(currentSet + 1);
				} else {
					setCompleted("🎉 Workout Complete! Great job!");
				}
			}
		} else if (currentType === "rest") {
			if (currentSet < config.sets) {
				setCurrentType("workout");
				setTimeLeft(config.workoutTime);
				setCurrentSet((prev) => prev + 1);
				timerToasts.nextRound(currentSet + 1);
			} else {
				setCompleted("🎉 Workout Complete! Great job!");
			}
		}
	};

	const resetState = () => {
		setCurrentSet(1);
		setCurrentType("prepare");
		setTimeLeft(5);
	};

	const startTimer = () => baseStartTimer();
	const resetTimer = () => baseResetTimer(resetState);
	const stopTimer = () => baseStopTimer(resetState);
	const handleHoldStart = () => baseHoldStart(stopTimer);

	const fastForward = () => {
		if (state === "idle" || state === "completed") return;

		if (timeLeft > 0) {
			setTimeLeft(0);
			timerToasts.fastForward("Skipped to end of interval");
		} else if (currentType === "prepare") {
			setCurrentType("workout");
			setTimeLeft(config.workoutTime);
			timerToasts.fastForward("Skipped to workout");
		} else if (currentType === "workout" && config.restTime > 0) {
			setCurrentType("rest");
			setTimeLeft(config.restTime);
			timerToasts.fastForward("Skipped to rest period");
		} else if (
			(currentType === "rest" || config.restTime === 0) &&
			currentSet < config.sets
		) {
			setCurrentType("workout");
			setTimeLeft(config.workoutTime);
			setCurrentSet((prev) => prev + 1);
			timerToasts.fastForward(`Skipped to set ${currentSet + 1}`);
		}
	};

	const fastBackward = () => {
		if (state === "idle" || state === "completed") return;

		const totalTime =
			currentType === "prepare"
				? 5
				: currentType === "workout"
					? config.workoutTime
					: config.restTime;

		if (timeLeft < totalTime) {
			setTimeLeft(totalTime);
			timerToasts.fastBackward("Jumped to start of interval");
		} else if (currentType === "workout" && currentSet === 1) {
			// Go back to prepare for first set
			setCurrentType("prepare");
			setTimeLeft(5);
			timerToasts.fastBackward("Jumped back to prepare");
		} else if (currentType === "rest" && currentSet >= 1) {
			setCurrentType("workout");
			setTimeLeft(config.workoutTime);
			timerToasts.fastBackward("Jumped back to workout period");
		} else if (currentType === "workout" && currentSet > 1) {
			if (config.restTime > 0) {
				setCurrentType("rest");
				setTimeLeft(config.restTime);
				setCurrentSet((prev) => prev - 1);
				timerToasts.fastBackward(`Jumped back to set ${currentSet - 1}`);
			} else {
				setTimeLeft(config.workoutTime);
				setCurrentSet((prev) => prev - 1);
				timerToasts.fastBackward(`Jumped back to set ${currentSet - 1}`);
			}
		}
	};

	const getCurrentIntervalName = () => {
		if (currentType === "prepare") return "PREPARE";
		return currentType === "workout" ? config.workoutName : "REST";
	};

	const getTimerProgress = () => {
		const totalTime =
			currentType === "prepare"
				? 5
				: currentType === "workout"
					? config.workoutTime
					: config.restTime;
		return getProgress(totalTime, timeLeft);
	};

	// Check if we should show minimalistic view
	const isMinimalisticView = state === "running" || state === "paused";

	// Calculate overall progress
	const getOverallProgress = () => {
		if (state === "idle" || state === "completed") return 0;

		const totalIntervals = config.sets * (config.restTime > 0 ? 2 : 1); // work + rest per set (if rest > 0)
		const completedIntervals = (currentSet - 1) * (config.restTime > 0 ? 2 : 1);

		let currentIntervalProgress = 0;
		if (currentType === "prepare") {
			currentIntervalProgress = 0;
		} else if (currentType === "workout") {
			currentIntervalProgress = completedIntervals;
			const workoutProgress = getProgress(config.workoutTime, timeLeft);
			currentIntervalProgress += workoutProgress / 100;
		} else if (currentType === "rest") {
			currentIntervalProgress = completedIntervals + 1;
			const restProgress = getProgress(config.restTime, timeLeft);
			currentIntervalProgress += restProgress / 100;
		}

		return Math.min(100, (currentIntervalProgress / totalIntervals) * 100);
	};

	// Calculate total time remaining
	const getTotalTimeRemaining = () => {
		if (state === "idle" || state === "completed") return 0;

		let remaining = timeLeft; // Current interval time

		// Add remaining intervals in current set
		if (currentType === "prepare") {
			remaining += config.workoutTime;
			if (config.restTime > 0) remaining += config.restTime;
		} else if (currentType === "workout" && config.restTime > 0) {
			remaining += config.restTime;
		}

		// Add remaining sets
		const remainingSets = config.sets - currentSet;
		if (remainingSets > 0) {
			const timePerSet =
				config.workoutTime + (config.restTime > 0 ? config.restTime : 0);
			remaining += remainingSets * timePerSet;
		}

		return remaining;
	};

	// Calculate total session time
	const getTotalSessionTime = () => {
		const prepareTime = 5; // 5 seconds prepare
		const timePerSet =
			config.workoutTime + (config.restTime > 0 ? config.restTime : 0);
		const totalWorkoutTime = config.sets * timePerSet;
		return prepareTime + totalWorkoutTime;
	};

	return (
		<div className="relative space-y-6">
			{/* Hide main workout timer tabs when timer is running */}
			{isMinimalisticView && (
				<MinimalisticContainer>
					<MinimalisticTimerView
						timeLeft={timeLeft}
						state={state}
						currentSet={currentSet}
						totalSets={config.sets}
						intervalType={getIntervalTypeForDisplay(currentType)}
						currentIntervalName={getCurrentIntervalName()}
						progress={getTimerProgress()}
						overallProgress={getOverallProgress()}
						totalTimeRemaining={getTotalTimeRemaining()}
						isHolding={isHolding}
						holdProgress={holdProgress}
						onFastBackward={fastBackward}
						onFastForward={fastForward}
						onHoldStart={handleHoldStart}
						onHoldEnd={handleHoldEnd}
						onPlay={startTimer}
						onPause={pauseTimer}
					/>
				</MinimalisticContainer>
			)}

			{!isMinimalisticView && (
				<Card>
					{/* <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell size={20} />
              Simple Workout Timer
            </CardTitle>
          </CardHeader> */}

					<CardContent className="space-y-6 pt-6">
						<div className="space-y-4 text-center">
							<div className="flex items-center justify-center gap-4">
								<StatCard
									label="Total Session Time"
									value={formatTime(getTotalSessionTime())}
								/>
								<StatCard
									label="Sets"
									value={config.sets}
									valueClassName="text-2xl font-bold"
								/>
							</div>

							{/* <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Work Time</div>
                  <div className="text-lg font-semibold text-green-500">
                    {formatTime(config.workoutTime)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Rest Time</div>
                  <div className="text-lg font-semibold text-blue-500">
                    {config.restTime > 0 ? formatTime(config.restTime) : "None"}
                  </div>
                </div>
              </div> */}
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
							<div className="space-y-2">
								<Label htmlFor="workoutName">Work Period Name</Label>
								<Input
									id="workoutName"
									type="text"
									value={config.workoutName}
									onChange={(e) =>
										setConfig((prev) => ({
											...prev,
											workoutName: e.target.value,
										}))
									}
									className="text-center"
									placeholder="WORK"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="workoutTime">Work Time</Label>
								<TimeInput
									id="workoutTime"
									value={config.workoutTime}
									onChange={(value) =>
										setConfig((prev) => ({ ...prev, workoutTime: value }))
									}
									min={1}
									step={5}
									placeholder="0:45"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="restTime">Rest Time</Label>
								<TimeInput
									id="restTime"
									value={config.restTime}
									onChange={(value) =>
										setConfig((prev) => ({ ...prev, restTime: value }))
									}
									min={0}
									step={5}
									placeholder="0:15"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="sets">Sets</Label>
								<NumberInput
									id="sets"
									value={config.sets}
									onChange={(value) =>
										setConfig((prev) => ({ ...prev, sets: value }))
									}
									min={1}
									step={1}
								/>
							</div>
						</div>

						<TimerControls
							state={state}
							onStart={startTimer}
							onPause={pauseTimer}
							onReset={resetTimer}
							onStop={stopTimer}
							onFastBackward={fastBackward}
							onFastForward={fastForward}
						/>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

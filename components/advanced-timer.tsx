"use client";

import { MinimalisticTimerView } from "@/components/minimalistic-timer-view";
import { TimerControls } from "@/components/timer-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTimerState } from "@/hooks/use-timer-state";
import { formatTime, getProgress, timerToasts } from "@/lib/timer-utils";
import {
  TimerType,
  getIntervalTypeForDisplay,
  mapIntervalTypeToTimerType,
} from "@/utils/timer-shared";
import { Minus, Plus, Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface IntervalStep {
  id: string;
  name: string;
  duration: number;
  type: "prepare" | "work" | "rest";
}

interface AdvancedConfig {
  intervals: IntervalStep[];
  sets: number;
}

export function AdvancedTimer() {
  const [config, setConfig] = useState<AdvancedConfig>({
    intervals: [
      { id: "1", name: "PREPARE", duration: 10, type: "prepare" },
      { id: "2", name: "WORK", duration: 45, type: "work" },
      { id: "3", name: "REST", duration: 15, type: "rest" },
    ],
    sets: 3,
  });

  const [currentType, setCurrentType] = useState<TimerType>("prepare");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);

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
      if (config.intervals.length > 0) {
        setTimeLeft(config.intervals[0].duration);
        setCurrentType(mapIntervalTypeToTimerType(config.intervals[0].type));
        setCurrentIntervalIndex(0);
      }
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
    const nextIntervalIndex = currentIntervalIndex + 1;

    if (nextIntervalIndex < config.intervals.length) {
      const nextInterval = config.intervals[nextIntervalIndex];
      setCurrentIntervalIndex(nextIntervalIndex);
      setCurrentType(mapIntervalTypeToTimerType(nextInterval.type));
      setTimeLeft(nextInterval.duration);
      timerToasts.nextInterval(nextInterval.name);
    } else {
      if (currentSet < config.sets) {
        setCurrentSet((prev) => prev + 1);
        setCurrentIntervalIndex(0);
        const firstInterval = config.intervals[0];
        setCurrentType(mapIntervalTypeToTimerType(firstInterval.type));
        setTimeLeft(firstInterval.duration);
        timerToasts.nextInterval(
          `Set ${currentSet + 1} - ${firstInterval.name}`,
        );
      } else {
        setCompleted("🎉 Advanced Workout Complete! Great job!");
      }
    }
  };

  const resetState = () => {
    setCurrentSet(1);
    setCurrentIntervalIndex(0);
  };

  const startTimer = () => baseStartTimer("Advanced Timer started!");
  const resetTimer = () => baseResetTimer(resetState);
  const stopTimer = () => baseStopTimer(resetState);
  const handleHoldStart = () => baseHoldStart(stopTimer);

  const fastForward = () => {
    if (
      state === "idle" ||
      state === "completed" ||
      config.intervals.length === 0
    )
      return;

    if (timeLeft > 0) {
      setTimeLeft(0);
      timerToasts.fastForward("Skipped to end of interval");
    } else {
      const nextIntervalIndex = currentIntervalIndex + 1;

      if (nextIntervalIndex < config.intervals.length) {
        const nextInterval = config.intervals[nextIntervalIndex];
        setCurrentIntervalIndex(nextIntervalIndex);
        setCurrentType(mapIntervalTypeToTimerType(nextInterval.type));
        setTimeLeft(nextInterval.duration);
        timerToasts.fastForward(`Skipped to ${nextInterval.name}`);
      } else if (currentSet < config.sets) {
        setCurrentSet((prev) => prev + 1);
        setCurrentIntervalIndex(0);
        const firstInterval = config.intervals[0];
        setCurrentType(mapIntervalTypeToTimerType(firstInterval.type));
        setTimeLeft(firstInterval.duration);
        timerToasts.fastForward(`Skipped to set ${currentSet + 1}`);
      }
    }
  };

  const fastBackward = () => {
    if (
      state === "idle" ||
      state === "completed" ||
      config.intervals.length === 0
    )
      return;

    const currentInterval = config.intervals[currentIntervalIndex];

    if (timeLeft < currentInterval.duration) {
      setTimeLeft(currentInterval.duration);
      timerToasts.fastBackward("Jumped to start of interval");
    } else {
      const prevIntervalIndex = currentIntervalIndex - 1;

      if (prevIntervalIndex >= 0) {
        const prevInterval = config.intervals[prevIntervalIndex];
        setCurrentIntervalIndex(prevIntervalIndex);
        setCurrentType(mapIntervalTypeToTimerType(prevInterval.type));
        setTimeLeft(prevInterval.duration);
        timerToasts.fastBackward(`Jumped back to ${prevInterval.name}`);
      } else if (currentSet > 1) {
        setCurrentSet((prev) => prev - 1);
        const lastIntervalIndex = config.intervals.length - 1;
        setCurrentIntervalIndex(lastIntervalIndex);
        const lastInterval = config.intervals[lastIntervalIndex];
        setCurrentType(mapIntervalTypeToTimerType(lastInterval.type));
        setTimeLeft(lastInterval.duration);
        timerToasts.fastBackward(`Jumped back to set ${currentSet - 1}`);
      }
    }
  };

  const getCurrentIntervalName = () => {
    if (config.intervals.length > 0) {
      return config.intervals[currentIntervalIndex]?.name || "INTERVAL";
    }
    return "INTERVAL";
  };

  const getTimerProgress = () => {
    if (config.intervals.length > 0) {
      const currentInterval = config.intervals[currentIntervalIndex];
      return getProgress(currentInterval.duration, timeLeft);
    }
    return 0;
  };

  const addInterval = () => {
    const newInterval: IntervalStep = {
      id: Date.now().toString(),
      name: "NEW EXERCISE",
      duration: 30,
      type: "work",
    };
    setConfig((prev) => ({
      ...prev,
      intervals: [...prev.intervals, newInterval],
    }));
  };

  const removeInterval = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      intervals: prev.intervals.filter((interval) => interval.id !== id),
    }));
  };

  const updateInterval = (
    id: string,
    field: keyof IntervalStep,
    value: string | number,
  ) => {
    setConfig((prev) => ({
      ...prev,
      intervals: prev.intervals.map((interval) =>
        interval.id === id
          ? {
              ...interval,
              [field]:
                field === "duration" ? Math.max(1, Number(value)) : value,
            }
          : interval,
      ),
    }));
  };

  // Calculate overall progress
  const getOverallProgress = () => {
    if (state === "idle" || state === "completed") return 0;

    const totalIntervals = config.sets * config.intervals.length;
    const completedIntervals =
      (currentSet - 1) * config.intervals.length + currentIntervalIndex;

    let currentIntervalProgress = 0;
    if (config.intervals.length > 0) {
      const currentInterval = config.intervals[currentIntervalIndex];
      currentIntervalProgress =
        getProgress(currentInterval.duration, timeLeft) / 100;
    }

    return Math.min(
      100,
      ((completedIntervals + currentIntervalProgress) / totalIntervals) * 100,
    );
  };

  // Calculate total time remaining
  const getTotalTimeRemaining = () => {
    if (state === "idle" || state === "completed") return 0;

    let remaining = timeLeft; // Current interval time

    // Add remaining intervals in current set
    for (let i = currentIntervalIndex + 1; i < config.intervals.length; i++) {
      remaining += config.intervals[i].duration;
    }

    // Add remaining sets
    const remainingSets = config.sets - currentSet;
    if (remainingSets > 0) {
      const timePerSet = config.intervals.reduce(
        (sum, interval) => sum + interval.duration,
        0,
      );
      remaining += remainingSets * timePerSet;
    }

    return remaining;
  };

  // Calculate total session time
  const getTotalSessionTime = () => {
    if (config.intervals.length === 0) return 0;
    const timePerSet = config.intervals.reduce(
      (sum, interval) => sum + interval.duration,
      0,
    );
    return config.sets * timePerSet;
  };

  // Check if we should show minimalistic view
  const isMinimalisticView = state === "running" || state === "paused";

  return (
    <div className="relative space-y-6">
      {/* Hide main workout timer tabs when timer is running */}
      {isMinimalisticView && (
        <Card className="relative flex min-h-[80vh] flex-col">
          <CardContent className="relative flex flex-1 flex-col justify-center overflow-hidden pt-4">
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
              showStepCounter={true}
              currentStep={currentIntervalIndex + 1}
              totalSteps={config.intervals.length}
              isHolding={isHolding}
              holdProgress={holdProgress}
              onFastBackward={fastBackward}
              onFastForward={fastForward}
              onHoldStart={handleHoldStart}
              onHoldEnd={handleHoldEnd}
              onPlay={startTimer}
              onPause={pauseTimer}
            />
          </CardContent>
        </Card>
      )}

      {!isMinimalisticView && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Advanced Workout Timer
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-4">
                <div className="rounded-lg bg-secondary px-4 py-2">
                  <div className="text-sm text-muted-foreground">
                    Total Session Time
                  </div>
                  <div className="font-mono text-2xl font-bold">
                    {formatTime(getTotalSessionTime())}
                  </div>
                </div>
                <div className="rounded-lg bg-secondary px-4 py-2">
                  <div className="text-sm text-muted-foreground">Sets</div>
                  <div className="text-2xl font-bold">{config.sets}</div>
                </div>
                <div className="rounded-lg bg-secondary px-4 py-2">
                  <div className="text-sm text-muted-foreground">Intervals</div>
                  <div className="text-2xl font-bold">
                    {config.intervals.length}
                  </div>
                </div>
              </div>

              {config.intervals.length > 0 && (
                <div className="mx-auto max-w-md">
                  <div className="mb-2 text-sm text-muted-foreground">
                    Interval Breakdown
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {config.intervals.map((interval, index) => (
                      <div
                        key={interval.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">
                          {index + 1}. {interval.name}
                        </span>
                        <span
                          className={`font-semibold ${interval.type === "work" ? "text-green-500" : "text-blue-500"}`}
                        >
                          {formatTime(interval.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Interval Sequence</h3>
                <Button
                  onClick={addInterval}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Plus size={16} />
                  Add Interval
                </Button>
              </div>

              <div className="max-h-60 space-y-3 overflow-y-auto">
                {config.intervals.map((interval, index) => (
                  <div
                    key={interval.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <span className="w-8 text-sm font-medium">
                      {index + 1}.
                    </span>

                    <Input
                      value={interval.name}
                      onChange={(e) =>
                        updateInterval(interval.id, "name", e.target.value)
                      }
                      className="flex-1"
                      placeholder="Exercise name"
                    />

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateInterval(
                            interval.id,
                            "duration",
                            interval.duration - 5,
                          )
                        }
                      >
                        <Minus size={12} />
                      </Button>
                      <Input
                        type="number"
                        value={interval.duration}
                        onChange={(e) =>
                          updateInterval(
                            interval.id,
                            "duration",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-20 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateInterval(
                            interval.id,
                            "duration",
                            interval.duration + 5,
                          )
                        }
                      >
                        <Plus size={12} />
                      </Button>
                    </div>

                    <select
                      value={interval.type}
                      onChange={(e) =>
                        updateInterval(interval.id, "type", e.target.value)
                      }
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="prepare">Prepare</option>
                      <option value="work">Work</option>
                      <option value="rest">Rest</option>
                    </select>

                    {config.intervals.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeInterval(interval.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Label htmlFor="advancedSets">Total Sets:</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        sets: Math.max(1, prev.sets - 1),
                      }))
                    }
                  >
                    <Minus size={16} />
                  </Button>
                  <Input
                    id="advancedSets"
                    type="number"
                    value={config.sets}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        sets: Math.max(1, parseInt(e.target.value) || 1),
                      }))
                    }
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, sets: prev.sets + 1 }))
                    }
                  >
                    <Plus size={16} />
                  </Button>
                </div>
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
              startLabel="Start Advanced Timer"
              resetLabel="Start New Advanced Workout"
              disabled={config.intervals.length === 0}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { TimerControls } from "@/components/timer-controls";
import { TimerDisplay } from "@/components/timer-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	formatTime,
	getProgress,
	TimerState,
	timerToasts,
} from "@/lib/timer-utils";
import {
	Minus,
	Plus,
	Settings,
	SkipBack,
	SkipForward,
	Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TimerType = "workout" | "rest";

interface IntervalStep {
  id: string;
  name: string;
  duration: number;
  type: "work" | "rest";
}

interface AdvancedConfig {
  intervals: IntervalStep[];
  sets: number;
}

export function AdvancedTimer() {
  const [config, setConfig] = useState<AdvancedConfig>({
    intervals: [
      { id: "1", name: "WORK", duration: 45, type: "work" },
      { id: "2", name: "REST", duration: 15, type: "rest" },
    ],
    sets: 3,
  });

  const [state, setState] = useState<TimerState>("idle");
  const [currentType, setCurrentType] = useState<TimerType>("workout");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer
  useEffect(() => {
    if (state === "idle") {
      if (config.intervals.length > 0) {
        setTimeLeft(config.intervals[0].duration);
        setCurrentType(
          config.intervals[0].type === "work" ? "workout" : "rest",
        );
        setCurrentIntervalIndex(0);
      }
      setCurrentSet(1);
    }
  }, [config, state]);

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
      setCurrentType(nextInterval.type === "work" ? "workout" : "rest");
      setTimeLeft(nextInterval.duration);
      timerToasts.nextInterval(nextInterval.name);
    } else {
      if (currentSet < config.sets) {
        setCurrentSet((prev) => prev + 1);
        setCurrentIntervalIndex(0);
        const firstInterval = config.intervals[0];
        setCurrentType(firstInterval.type === "work" ? "workout" : "rest");
        setTimeLeft(firstInterval.duration);
        timerToasts.nextInterval(
          `Set ${currentSet + 1} - ${firstInterval.name}`,
        );
      } else {
        setState("completed");
        timerToasts.complete("🎉 Advanced Workout Complete! Great job!");
      }
    }
  };

  const resetState = () => {
    setCurrentSet(1);
    setCurrentIntervalIndex(0);
  };

  const startTimer = () => {
    setState("running");
    timerToasts.start("Advanced Timer started!");
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

  const resetTimer = () => {
    setState("idle");
    resetState();
    timerToasts.reset();
    // Dispatch event to parent
    window.dispatchEvent(
      new CustomEvent("timerStateChange", { detail: { isRunning: false } }),
    );
  };

  const stopTimer = () => {
    setState("idle");
    resetState();
    timerToasts.stop();
    // Dispatch event to parent
    window.dispatchEvent(
      new CustomEvent("timerStateChange", { detail: { isRunning: false } }),
    );
  };

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
        setCurrentType(nextInterval.type === "work" ? "workout" : "rest");
        setTimeLeft(nextInterval.duration);
        timerToasts.fastForward(`Skipped to ${nextInterval.name}`);
      } else if (currentSet < config.sets) {
        setCurrentSet((prev) => prev + 1);
        setCurrentIntervalIndex(0);
        const firstInterval = config.intervals[0];
        setCurrentType(firstInterval.type === "work" ? "workout" : "rest");
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
        setCurrentType(prevInterval.type === "work" ? "workout" : "rest");
        setTimeLeft(prevInterval.duration);
        timerToasts.fastBackward(`Jumped back to ${prevInterval.name}`);
      } else if (currentSet > 1) {
        setCurrentSet((prev) => prev - 1);
        const lastIntervalIndex = config.intervals.length - 1;
        setCurrentIntervalIndex(lastIntervalIndex);
        const lastInterval = config.intervals[lastIntervalIndex];
        setCurrentType(lastInterval.type === "work" ? "workout" : "rest");
        setTimeLeft(lastInterval.duration);
        timerToasts.fastBackward(`Jumped back to set ${currentSet - 1}`);
      }
    }
  };

  const handleHoldStart = () => {
    setIsHolding(true);
    setHoldProgress(0);

    // Progress animation
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current!);
          return 100;
        }
        return prev + 10; // 10% every 100ms = 1 second total
      });
    }, 100);

    // Actual exit after 1 second
    holdTimeoutRef.current = setTimeout(() => {
      stopTimer();
      setIsHolding(false);
      setHoldProgress(0);
    }, 1000);
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
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

  // Map timer type to display interval type for color coding
  const getIntervalTypeForDisplay = (): "workout" | "rest" => {
    return currentType;
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
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${getOverallProgress()}%` }}
          />
        </div>
      )}

      <Card className={isMinimalisticView ? "flex min-h-[80vh] flex-col" : ""}>
        {!isMinimalisticView ? (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Advanced Workout Timer
            </CardTitle>
          </CardHeader>
        ) : (
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button
                onClick={fastBackward}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <SkipBack size={16} />
              </Button>

              <div className="relative">
                <Button
                  onMouseDown={handleHoldStart}
                  onMouseUp={handleHoldEnd}
                  onMouseLeave={handleHoldEnd}
                  onTouchStart={handleHoldStart}
                  onTouchEnd={handleHoldEnd}
                  variant="default"
                  size="sm"
                  className="relative overflow-hidden bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700"
                >
                  <div
                    className="absolute inset-0 bg-green-800 transition-all duration-100 ease-out"
                    style={{ width: `${holdProgress}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="6" y="6" width="12" height="12" />
                    </svg>
                    Hold to Exit
                  </span>
                </Button>
              </div>

              <Button
                onClick={fastForward}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <SkipForward size={16} />
              </Button>
            </div>

            {/* Total remaining time */}
            <div className="mt-2 flex justify-center">
              <div className="text-xs text-muted-foreground">
                Total remaining: {formatTime(getTotalTimeRemaining())}
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent
          className={
            isMinimalisticView
              ? "flex flex-1 flex-col justify-center overflow-hidden pt-4"
              : "space-y-6"
          }
        >
          {isMinimalisticView ? (
            <TimerDisplay
              timeLeft={timeLeft}
              state={state}
              currentIntervalName={getCurrentIntervalName()}
              currentRound={currentSet}
              totalRounds={config.sets}
              progress={getTimerProgress()}
              intervalType={getIntervalTypeForDisplay()}
              showStepCounter={true}
              currentStep={currentIntervalIndex + 1}
              totalSteps={config.intervals.length}
            />
          ) : (
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
          )}

          {!isMinimalisticView && (
            <>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Floating Pause/Resume Button */}
      {(state === "running" || state === "paused") && (
        <div className="fixed bottom-6 right-6 z-50">
          {state === "running" ? (
            <Button
              onClick={pauseTimer}
              size="lg"
              variant="secondary"
              className="h-16 w-16 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            </Button>
          ) : (
            <Button
              onClick={startTimer}
              size="lg"
              className="h-16 w-16 rounded-full bg-green-600 shadow-lg transition-all duration-200 hover:bg-green-700 hover:shadow-xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1 text-white"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

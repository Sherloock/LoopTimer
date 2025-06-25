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
import { Dumbbell, Minus, Plus, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TimerType = "prepare" | "workout" | "rest";

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

  const [state, setState] = useState<TimerState>("idle");
  const [currentType, setCurrentType] = useState<TimerType>("prepare");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer
  useEffect(() => {
    if (state === "idle") {
      setTimeLeft(5); // Start with 5-second prepare
      setCurrentType("prepare");
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
          setState("completed");
          timerToasts.complete("🎉 Workout Complete! Great job!");
        }
      }
    } else if (currentType === "rest") {
      if (currentSet < config.sets) {
        setCurrentType("workout");
        setTimeLeft(config.workoutTime);
        setCurrentSet((prev) => prev + 1);
        timerToasts.nextRound(currentSet + 1);
      } else {
        setState("completed");
        timerToasts.complete("🎉 Workout Complete! Great job!");
      }
    }
  };

  const resetState = () => {
    setCurrentSet(1);
    setCurrentType("prepare");
    setTimeLeft(5);
  };

  const startTimer = () => {
    setState("running");
    timerToasts.start();
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

  const parseTimeInput = (value: string): number => {
    // Handle mm:ss format
    if (value.includes(":")) {
      const [minutes, seconds] = value.split(":").map(Number);
      if (!isNaN(minutes) && !isNaN(seconds)) {
        return Math.max(0, minutes * 60 + seconds);
      }
    }
    // Handle plain seconds
    const parsed = parseInt(value) || 0;
    return Math.max(0, parsed);
  };

  const formatTimeInput = (seconds: number): string => {
    return formatTime(seconds);
  };

  const updateConfig = (
    field: keyof SimpleTimerConfig,
    value: number | string,
  ) => {
    if (field === "workoutTime" || field === "restTime") {
      const timeValue =
        typeof value === "string" ? parseTimeInput(value) : Math.max(0, value);
      setConfig((prev) => ({
        ...prev,
        [field]: timeValue,
      }));
    } else if (field === "sets") {
      setConfig((prev) => ({
        ...prev,
        [field]: Math.max(
          1,
          typeof value === "number" ? value : parseInt(value as string) || 1,
        ),
      }));
    } else if (field === "workoutName") {
      setConfig((prev) => ({
        ...prev,
        [field]: value as string,
      }));
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

  // Map timer type to display interval type for color coding
  const getIntervalTypeForDisplay = (): "workout" | "rest" | "prepare" => {
    return currentType;
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
    <div className="space-y-6">
      {/* Hide main workout timer tabs when timer is running */}
      {isMinimalisticView && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${getOverallProgress()}%` }}
          />
        </div>
      )}

      <Card>
        {!isMinimalisticView ? (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell size={20} />
              Simple Workout Timer
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

              <div className="flex items-center gap-2">
                {state === "running" && (
                  <Button
                    onClick={pauseTimer}
                    variant="secondary"
                    size="sm"
                    className="px-3 py-1 text-xs"
                  >
                    Pause
                  </Button>
                )}

                <div className="relative">
                  <Button
                    onMouseDown={handleHoldStart}
                    onMouseUp={handleHoldEnd}
                    onMouseLeave={handleHoldEnd}
                    onTouchStart={handleHoldStart}
                    onTouchEnd={handleHoldEnd}
                    variant="destructive"
                    size="sm"
                    className="relative overflow-hidden px-4 py-2 text-xs font-medium"
                  >
                    <div
                      className="absolute inset-0 bg-red-600 transition-all duration-100 ease-out"
                      style={{ width: `${holdProgress}%` }}
                    />
                    <span className="relative z-10">Hold to Exit</span>
                  </Button>
                </div>
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

            {/* Overall timer info */}
            {isMinimalisticView && (
              <div className="mt-2 flex justify-center">
                <div className="text-xs text-muted-foreground">
                  Total remaining: {formatTime(getTotalTimeRemaining())}
                </div>
              </div>
            )}
          </CardHeader>
        )}

        <CardContent className={isMinimalisticView ? "pt-4" : "space-y-6"}>
          {isMinimalisticView ? (
            <TimerDisplay
              timeLeft={timeLeft}
              state={state}
              currentIntervalName={getCurrentIntervalName()}
              currentRound={currentSet}
              totalRounds={config.sets}
              progress={getTimerProgress()}
              intervalType={getIntervalTypeForDisplay()}
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
              </div>

              <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
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
              </div>
            </div>
          )}

          {!isMinimalisticView && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="workoutName">Work Period Name</Label>
                  <Input
                    id="workoutName"
                    type="text"
                    value={config.workoutName}
                    onChange={(e) =>
                      updateConfig("workoutName", e.target.value)
                    }
                    className="text-center"
                    placeholder="WORK"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workoutTime">Work Time</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateConfig("workoutTime", config.workoutTime - 5)
                      }
                    >
                      <Minus size={16} />
                    </Button>
                    <Input
                      id="workoutTime"
                      type="text"
                      value={formatTimeInput(config.workoutTime)}
                      onChange={(e) =>
                        updateConfig("workoutTime", e.target.value)
                      }
                      className="text-center"
                      placeholder="0:45"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateConfig("workoutTime", config.workoutTime + 5)
                      }
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restTime">Rest Time</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateConfig(
                          "restTime",
                          Math.max(0, config.restTime - 5),
                        )
                      }
                    >
                      <Minus size={16} />
                    </Button>
                    <Input
                      id="restTime"
                      type="text"
                      value={formatTimeInput(config.restTime)}
                      onChange={(e) => updateConfig("restTime", e.target.value)}
                      className="text-center"
                      placeholder="0:15"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateConfig("restTime", config.restTime + 5)
                      }
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sets">Sets</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateConfig("sets", config.sets - 1)}
                    >
                      <Minus size={16} />
                    </Button>
                    <Input
                      id="sets"
                      type="number"
                      value={config.sets}
                      onChange={(e) =>
                        updateConfig("sets", parseInt(e.target.value) || 1)
                      }
                      className="text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateConfig("sets", config.sets + 1)}
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
              />
            </>
          )}

          {isMinimalisticView && state === "paused" && (
            <div className="mt-4 flex justify-center">
              <Button onClick={startTimer} size="lg" className="gap-2">
                Resume
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { TimerControls } from "@/components/timer-controls";
import { TimerDisplay } from "@/components/timer-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProgress, TimerState, timerToasts } from "@/lib/timer-utils";
import { Minus, Plus, Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type TimerType = "workout" | "rest";

interface IntervalStep {
  id: string;
  name: string;
  duration: number;
  type: "work" | "rest";
}

interface AdvancedConfig {
  intervals: IntervalStep[];
  rounds: number;
}

export function AdvancedTimer() {
  const [config, setConfig] = useState<AdvancedConfig>({
    intervals: [
      { id: "1", name: "WORK", duration: 45, type: "work" },
      { id: "2", name: "REST", duration: 15, type: "rest" },
    ],
    rounds: 3,
  });

  const [state, setState] = useState<TimerState>("idle");
  const [currentType, setCurrentType] = useState<TimerType>("workout");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);

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
      setCurrentRound(1);
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
      if (currentRound < config.rounds) {
        setCurrentRound((prev) => prev + 1);
        setCurrentIntervalIndex(0);
        const firstInterval = config.intervals[0];
        setCurrentType(firstInterval.type === "work" ? "workout" : "rest");
        setTimeLeft(firstInterval.duration);
        timerToasts.nextInterval(
          `Round ${currentRound + 1} - ${firstInterval.name}`,
        );
      } else {
        setState("completed");
        timerToasts.complete("🎉 Advanced Workout Complete! Great job!");
      }
    }
  };

  const resetState = () => {
    setCurrentRound(1);
    setCurrentIntervalIndex(0);
  };

  const startTimer = () => {
    setState("running");
    timerToasts.start("Advanced Timer started!");
  };

  const pauseTimer = () => {
    setState("paused");
    timerToasts.pause();
  };

  const resetTimer = () => {
    setState("idle");
    resetState();
    timerToasts.reset();
  };

  const stopTimer = () => {
    setState("idle");
    resetState();
    timerToasts.stop();
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
      } else if (currentRound < config.rounds) {
        setCurrentRound((prev) => prev + 1);
        setCurrentIntervalIndex(0);
        const firstInterval = config.intervals[0];
        setCurrentType(firstInterval.type === "work" ? "workout" : "rest");
        setTimeLeft(firstInterval.duration);
        timerToasts.fastForward(`Skipped to round ${currentRound + 1}`);
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
      } else if (currentRound > 1) {
        setCurrentRound((prev) => prev - 1);
        const lastIntervalIndex = config.intervals.length - 1;
        setCurrentIntervalIndex(lastIntervalIndex);
        const lastInterval = config.intervals[lastIntervalIndex];
        setCurrentType(lastInterval.type === "work" ? "workout" : "rest");
        setTimeLeft(lastInterval.duration);
        timerToasts.fastBackward(`Jumped back to round ${currentRound - 1}`);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings size={20} />
          Advanced Workout Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <TimerDisplay
          timeLeft={timeLeft}
          state={state}
          currentIntervalName={getCurrentIntervalName()}
          currentRound={currentRound}
          totalRounds={config.rounds}
          progress={getTimerProgress()}
          intervalType={currentType}
          showStepCounter={true}
          currentStep={currentIntervalIndex + 1}
          totalSteps={config.intervals.length}
        />

        {state === "idle" && (
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
                  <span className="w-8 text-sm font-medium">{index + 1}.</span>

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
              <Label htmlFor="advancedRounds">Total Rounds:</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      rounds: Math.max(1, prev.rounds - 1),
                    }))
                  }
                >
                  <Minus size={16} />
                </Button>
                <Input
                  id="advancedRounds"
                  type="number"
                  value={config.rounds}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      rounds: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, rounds: prev.rounds + 1 }))
                  }
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}

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
  );
}

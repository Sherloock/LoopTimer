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
import { Dumbbell, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type TimerType = "workout" | "rest";

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
  const [currentType, setCurrentType] = useState<TimerType>("workout");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  // Initialize timer
  useEffect(() => {
    if (state === "idle") {
      setTimeLeft(config.workoutTime);
      setCurrentType("workout");
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
    if (currentType === "workout") {
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
  };

  const startTimer = () => {
    setState("running");
    timerToasts.start();
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
    if (state === "idle" || state === "completed") return;

    if (timeLeft > 0) {
      setTimeLeft(0);
      timerToasts.fastForward("Skipped to end of interval");
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
      currentType === "workout" ? config.workoutTime : config.restTime;

    if (timeLeft < totalTime) {
      setTimeLeft(totalTime);
      timerToasts.fastBackward("Jumped to start of interval");
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
    return currentType === "workout" ? config.workoutName : "REST";
  };

  const getTimerProgress = () => {
    const totalTime =
      currentType === "workout" ? config.workoutTime : config.restTime;
    return getProgress(totalTime, timeLeft);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell size={20} />
          Simple Workout Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <TimerDisplay
          timeLeft={timeLeft}
          state={state}
          currentIntervalName={getCurrentIntervalName()}
          currentRound={currentSet}
          totalRounds={config.sets}
          progress={getTimerProgress()}
          intervalType={currentType}
        />

        {state === "idle" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="workoutName">Work Period Name</Label>
              <Input
                id="workoutName"
                type="text"
                value={config.workoutName}
                onChange={(e) => updateConfig("workoutName", e.target.value)}
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
                  onChange={(e) => updateConfig("workoutTime", e.target.value)}
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
                    updateConfig("restTime", Math.max(0, config.restTime - 5))
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
                  onClick={() => updateConfig("restTime", config.restTime + 5)}
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
        )}

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
  );
}

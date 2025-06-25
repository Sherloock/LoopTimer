"use client";

import { TimerControls } from "@/components/timer-controls";
import { TimerDisplay } from "@/components/timer-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProgress, TimerState, timerToasts } from "@/lib/timer-utils";
import { Dumbbell, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type TimerType = "workout" | "rest";

interface SimpleTimerConfig {
  workoutTime: number;
  restTime: number;
  rounds: number;
  workoutName: string;
}

export function SimpleTimer() {
  const [config, setConfig] = useState<SimpleTimerConfig>({
    workoutTime: 45,
    restTime: 15,
    rounds: 8,
    workoutName: "WORK",
  });

  const [state, setState] = useState<TimerState>("idle");
  const [currentType, setCurrentType] = useState<TimerType>("workout");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);

  // Initialize timer
  useEffect(() => {
    if (state === "idle") {
      setTimeLeft(config.workoutTime);
      setCurrentType("workout");
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
    if (currentType === "workout") {
      setCurrentType("rest");
      setTimeLeft(config.restTime);
      timerToasts.restTime();
    } else if (currentType === "rest") {
      if (currentRound < config.rounds) {
        setCurrentType("workout");
        setTimeLeft(config.workoutTime);
        setCurrentRound((prev) => prev + 1);
        timerToasts.nextRound(currentRound + 1);
      } else {
        setState("completed");
        timerToasts.complete("🎉 Workout Complete! Great job!");
      }
    }
  };

  const resetState = () => {
    setCurrentRound(1);
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
    } else if (currentType === "rest" && currentRound < config.rounds) {
      setCurrentType("workout");
      setTimeLeft(config.workoutTime);
      setCurrentRound((prev) => prev + 1);
      timerToasts.fastForward(`Skipped to round ${currentRound + 1}`);
    }
  };

  const fastBackward = () => {
    if (state === "idle" || state === "completed") return;

    const totalTime =
      currentType === "workout" ? config.workoutTime : config.restTime;

    if (timeLeft < totalTime) {
      setTimeLeft(totalTime);
      timerToasts.fastBackward("Jumped to start of interval");
    } else if (currentType === "rest" && currentRound >= 1) {
      setCurrentType("workout");
      setTimeLeft(config.workoutTime);
      timerToasts.fastBackward("Jumped back to workout period");
    } else if (currentType === "workout" && currentRound > 1) {
      setCurrentType("rest");
      setTimeLeft(config.restTime);
      setCurrentRound((prev) => prev - 1);
      timerToasts.fastBackward(`Jumped back to round ${currentRound - 1}`);
    }
  };

  const updateConfig = (
    field: keyof SimpleTimerConfig,
    value: number | string,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: typeof value === "number" ? Math.max(1, value) : value,
    }));
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
          currentRound={currentRound}
          totalRounds={config.rounds}
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
              <Label htmlFor="workoutTime">Work Time (seconds)</Label>
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
                  type="number"
                  value={config.workoutTime}
                  onChange={(e) =>
                    updateConfig("workoutTime", parseInt(e.target.value) || 1)
                  }
                  className="text-center"
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
              <Label htmlFor="restTime">Rest Time (seconds)</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateConfig("restTime", config.restTime - 5)}
                >
                  <Minus size={16} />
                </Button>
                <Input
                  id="restTime"
                  type="number"
                  value={config.restTime}
                  onChange={(e) =>
                    updateConfig("restTime", parseInt(e.target.value) || 1)
                  }
                  className="text-center"
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
              <Label htmlFor="rounds">Rounds</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateConfig("rounds", config.rounds - 1)}
                >
                  <Minus size={16} />
                </Button>
                <Input
                  id="rounds"
                  type="number"
                  value={config.rounds}
                  onChange={(e) =>
                    updateConfig("rounds", parseInt(e.target.value) || 1)
                  }
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateConfig("rounds", config.rounds + 1)}
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

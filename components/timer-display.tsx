"use client";

import { Badge } from "@/components/ui/badge";
import { formatTime, TimerState } from "@/lib/timer-utils";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  timeLeft: number;
  state: TimerState;
  currentIntervalName: string;
  currentRound: number;
  totalRounds: number;
  progress: number;
  intervalType?: "workout" | "rest" | "prepare";
  showStepCounter?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export function TimerDisplay({
  timeLeft,
  state,
  currentIntervalName,
  currentRound,
  totalRounds,
  progress,
  intervalType = "workout",
  showStepCounter = false,
  currentStep,
  totalSteps,
}: TimerDisplayProps) {
  const getIntervalBadgeColor = () => {
    switch (intervalType) {
      case "prepare":
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case "workout":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "rest":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      default:
        return "default";
    }
  };

  const getTimerDisplayColor = () => {
    switch (intervalType) {
      case "prepare":
        return "text-orange-500";
      case "workout":
        return "text-green-500";
      case "rest":
        return "text-blue-500";
      default:
        return "text-primary";
    }
  };

  const getProgressColor = () => {
    switch (intervalType) {
      case "prepare":
        return "bg-orange-500";
      case "workout":
        return "bg-green-500";
      case "rest":
        return "bg-blue-500";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-4">
        <Badge className={cn("px-4 py-2 text-lg", getIntervalBadgeColor())}>
          {currentIntervalName}
        </Badge>
        <Badge variant="outline" className="px-4 py-2 text-lg">
          Set {currentRound}/{totalRounds}
        </Badge>
        {showStepCounter && currentStep && totalSteps && (
          <Badge variant="outline" className="px-3 py-1 text-sm">
            Step {currentStep}/{totalSteps}
          </Badge>
        )}
      </div>

      <div
        className={cn(
          "timer-display font-mono text-8xl font-bold",
          getTimerDisplayColor(),
          state === "running" && timeLeft <= 5 && "pulse-animation",
        )}
      >
        {formatTime(timeLeft)}
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full transition-all duration-300",
            getProgressColor(),
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

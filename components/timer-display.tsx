"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatTime, TimerState } from "@/lib/timer-utils";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  timeLeft: number;
  state: TimerState;
  currentIntervalName: string;
  currentRound: number;
  totalRounds: number;
  progress: number;
  intervalType?: "workout" | "rest";
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
  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-4">
        <Badge
          variant={intervalType === "workout" ? "default" : "secondary"}
          className="px-4 py-2 text-lg"
        >
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
          state === "running" &&
            timeLeft <= 5 &&
            "pulse-animation text-destructive",
        )}
      >
        {formatTime(timeLeft)}
      </div>

      <Progress value={progress} className="h-3" />
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { TimerState } from "@/lib/timer-utils";
import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
} from "lucide-react";

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStop: () => void;
  onFastBackward?: () => void;
  onFastForward?: () => void;
  startLabel?: string;
  resetLabel?: string;
  disabled?: boolean;
}

export function TimerControls({
  state,
  onStart,
  onPause,
  onReset,
  onStop,
  onFastBackward,
  onFastForward,
  startLabel = "Start",
  resetLabel = "Start New Workout",
  disabled = false,
}: TimerControlsProps) {
  return (
    <div className="flex justify-center gap-3">
      {(state === "running" || state === "paused") && onFastBackward && (
        <Button
          onClick={onFastBackward}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <SkipBack size={20} />
        </Button>
      )}

      {state === "idle" && (
        <Button
          onClick={onStart}
          size="lg"
          className="gap-2"
          disabled={disabled}
        >
          <Play size={20} />
          {startLabel}
        </Button>
      )}

      {state === "running" && (
        <Button
          onClick={onPause}
          variant="secondary"
          size="lg"
          className="gap-2"
        >
          <Pause size={20} />
          Pause
        </Button>
      )}

      {state === "paused" && (
        <>
          <Button onClick={onStart} size="lg" className="gap-2">
            <Play size={20} />
            Resume
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <RotateCcw size={20} />
            Reset
          </Button>
        </>
      )}

      {(state === "running" || state === "paused") && (
        <>
          <Button
            onClick={onStop}
            variant="destructive"
            size="lg"
            className="gap-2"
          >
            <Square size={20} />
            Stop
          </Button>
          {onFastForward && (
            <Button
              onClick={onFastForward}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <SkipForward size={20} />
            </Button>
          )}
        </>
      )}

      {state === "completed" && (
        <Button onClick={onReset} size="lg" className="gap-2">
          <RotateCcw size={20} />
          {resetLabel}
        </Button>
      )}
    </div>
  );
}

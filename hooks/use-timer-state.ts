import { TimerState, timerToasts } from "@/lib/timer-utils";
import { useRef, useState } from "react";

export function useTimerState() {
  const [state, setState] = useState<TimerState>("idle");
  const [currentSet, setCurrentSet] = useState(1);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = (message?: string) => {
    setState("running");
    timerToasts.start(message);
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

  const resetTimer = (resetStateFn: () => void) => {
    setState("idle");
    resetStateFn();
    timerToasts.reset();
    // Dispatch event to parent
    window.dispatchEvent(
      new CustomEvent("timerStateChange", { detail: { isRunning: false } }),
    );
  };

  const stopTimer = (resetStateFn: () => void) => {
    setState("idle");
    resetStateFn();
    timerToasts.stop();
    // Dispatch event to parent
    window.dispatchEvent(
      new CustomEvent("timerStateChange", { detail: { isRunning: false } }),
    );
  };

  const handleHoldStart = (onComplete: () => void) => {
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
      onComplete();
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

  const setCompleted = (message?: string) => {
    setState("completed");
    timerToasts.complete(message || "🎉 Workout Complete! Great job!");
  };

  return {
    state,
    setState,
    currentSet,
    setCurrentSet,
    isHolding,
    holdProgress,
    startTimer,
    pauseTimer,
    resetTimer,
    stopTimer,
    handleHoldStart,
    handleHoldEnd,
    setCompleted,
  };
}

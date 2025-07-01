import { toast } from "sonner";

export type TimerState = "idle" | "running" | "paused" | "completed";

export const formatTime = (seconds: number): string => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const getProgress = (totalTime: number, timeLeft: number): number => {
	return ((totalTime - timeLeft) / totalTime) * 100;
};

export const timerToasts = {
	start: (message: string = "Timer started!") =>
		toast.info(message, { id: "timer-start" }),

	pause: () => toast.info("Timer paused", { id: "timer-pause" }),

	reset: () => toast.info("Timer reset", { id: "timer-reset" }),

	stop: () => toast.info("Timer stopped", { id: "timer-stop" }),

	complete: (message: string) =>
		toast.success(message, { id: "workout-complete" }),

	restTime: () =>
		toast.success("Rest time! Take a breather.", { id: "rest-time" }),

	nextRound: (round: number) =>
		toast.success(`Round ${round} - Let's go!`, { id: "next-round" }),

	nextInterval: (name: string) =>
		toast.success(`${name}!`, { id: "next-interval" }),

	fastForward: (message: string) => toast.info(message, { id: "fast-forward" }),

	fastBackward: (message: string) =>
		toast.info(message, { id: "fast-backward" }),
};

export const timerControls = {
	startTimer: (setState: (state: TimerState) => void, message?: string) => {
		setState("running");
		timerToasts.start(message);
	},

	pauseTimer: (setState: (state: TimerState) => void) => {
		setState("paused");
		timerToasts.pause();
	},

	resetTimer: (setState: (state: TimerState) => void, resetFn?: () => void) => {
		setState("idle");
		resetFn?.();
		timerToasts.reset();
	},

	stopTimer: (setState: (state: TimerState) => void, resetFn?: () => void) => {
		setState("idle");
		resetFn?.();
		timerToasts.stop();
	},
};

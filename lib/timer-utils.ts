import { toast } from "sonner";

export type TimerState = "idle" | "running" | "paused" | "completed";

// Toast configuration for developer control
type ToastTypes = {
	start: boolean;
	pause: boolean;
	reset: boolean;
	stop: boolean;
	complete: boolean;
	restTime: boolean;
	nextRound: boolean;
	nextInterval: boolean;
	fastForward: boolean;
	fastBackward: boolean;
};

export const toastConfig = {
	enabled: {
		start: true,
		pause: false,
		reset: true,
		stop: false,
		complete: false,
		restTime: false,
		nextRound: false,
		nextInterval: false,
		fastForward: false,
		fastBackward: false,
	} as ToastTypes,
	// Quick enable/disable all toasts
	enableAll: () => {
		Object.keys(toastConfig.enabled).forEach((key) => {
			toastConfig.enabled[key as keyof ToastTypes] = true;
		});
	},
	disableAll: () => {
		Object.keys(toastConfig.enabled).forEach((key) => {
			toastConfig.enabled[key as keyof ToastTypes] = false;
		});
	},
	// Enable/disable specific toast types
	enable: (...types: (keyof ToastTypes)[]) => {
		types.forEach((type) => {
			toastConfig.enabled[type] = true;
		});
	},
	disable: (...types: (keyof ToastTypes)[]) => {
		types.forEach((type) => {
			toastConfig.enabled[type] = false;
		});
	},
};

// Helper function to conditionally show toasts
const showToast = (type: keyof ToastTypes, toastFn: () => void) => {
	if (toastConfig.enabled[type]) {
		toastFn();
	}
};

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
		showToast("start", () => toast.info(message, { id: "timer-start" })),

	pause: () =>
		showToast("pause", () => toast.info("Timer paused", { id: "timer-pause" })),

	reset: () =>
		showToast("reset", () => toast.info("Timer reset", { id: "timer-reset" })),

	stop: () =>
		showToast("stop", () => toast.info("Timer stopped", { id: "timer-stop" })),

	complete: (message: string) =>
		showToast("complete", () =>
			toast.success(message, { id: "workout-complete" }),
		),

	restTime: () =>
		showToast("restTime", () =>
			toast.success("Rest time! Take a breather.", { id: "rest-time" }),
		),

	nextRound: (round: number) =>
		showToast("nextRound", () =>
			toast.success(`Round ${round} - Let's go!`, { id: "next-round" }),
		),

	nextInterval: (name: string) =>
		showToast("nextInterval", () =>
			toast.success(`${name}!`, { id: "next-interval" }),
		),

	fastForward: (message: string) =>
		showToast("fastForward", () => toast.info(message, { id: "fast-forward" })),

	fastBackward: (message: string) =>
		showToast("fastBackward", () =>
			toast.info(message, { id: "fast-backward" }),
		),
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

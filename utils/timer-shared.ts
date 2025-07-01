import { formatTime } from "@/lib/timer-utils";

export type TimerType = "prepare" | "workout" | "rest";

export function parseTimeInput(value: string): number {
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
}

export function formatTimeInput(seconds: number): string {
	return formatTime(seconds);
}

export function getIntervalTypeForDisplay(
	currentType: TimerType,
): "workout" | "rest" | "prepare" {
	if (currentType === "workout") return "workout";
	if (currentType === "rest") return "rest";
	return "prepare";
}

export function mapIntervalTypeToTimerType(
	intervalType: "prepare" | "work" | "rest",
): TimerType {
	if (intervalType === "work") return "workout";
	if (intervalType === "rest") return "rest";
	return "prepare";
}

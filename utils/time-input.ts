import { formatTime } from "@/utils/format-time";

export function parseTimeInput(value: string): number {
	// Handle mm:ss format
	if (value.includes(":")) {
		const [minutes, seconds] = value.split(":").map(Number);
		if (!isNaN(minutes) && !isNaN(seconds)) {
			return Math.max(0, minutes * 60 + seconds);
		}
	}
	// Handle plain numbers as MMSS (minutes:seconds)
	const digits = value.replace(/\D/g, "");
	if (digits.length >= 3) {
		const mins = parseInt(digits.slice(0, -2)) || 0;
		const secs = parseInt(digits.slice(-2)) || 0;
		return Math.max(0, mins * 60 + secs);
	}
	// 1-2 digit input: treat as seconds
	const parsed = parseInt(digits) || 0;
	return Math.max(0, parsed);
}

export function formatTimeInput(seconds: number): string {
	return formatTime(seconds);
}

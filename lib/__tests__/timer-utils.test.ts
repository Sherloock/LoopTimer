import { formatTime, getProgress } from "@/lib/timer-utils";

describe("timer-utils", () => {
	describe("formatTime", () => {
		it("formats seconds as mm:ss", () => {
			expect(formatTime(0)).toBe("00:00");
			expect(formatTime(5)).toBe("00:05");
			expect(formatTime(65)).toBe("01:05");
			expect(formatTime(600)).toBe("10:00");
		});
	});

	describe("getProgress", () => {
		it("returns percent elapsed", () => {
			expect(getProgress(100, 100)).toBe(0);
			expect(getProgress(100, 50)).toBe(50);
			expect(getProgress(100, 0)).toBe(100);
		});
	});
});

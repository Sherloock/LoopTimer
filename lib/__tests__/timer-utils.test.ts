import {
	formatTime,
	formatTimeCompact,
	formatTimeMinutes,
	formatTimeWithLabel,
	getProgress,
	toastConfig,
	timerControls,
} from "@/lib/timer-utils";

describe("timer-utils", () => {
	describe("formatTime", () => {
		it("formats seconds as mm:ss", () => {
			expect(formatTime(0)).toBe("00:00");
			expect(formatTime(5)).toBe("00:05");
			expect(formatTime(65)).toBe("01:05");
			expect(formatTime(600)).toBe("10:00");
		});
	});

	describe("formatTimeCompact", () => {
		it("formats with h/m when >= 1h", () => {
			expect(formatTimeCompact(3600)).toMatch(/1h/);
			expect(formatTimeCompact(3660)).toMatch(/1h.*1m/);
		});
		it("formats mm:ss when < 1h", () => {
			expect(formatTimeCompact(90)).toBe("1:30");
		});
	});

	describe("formatTimeMinutes", () => {
		it("returns rounded minutes with label", () => {
			expect(formatTimeMinutes(60)).toBe("1 min");
			expect(formatTimeMinutes(90)).toBe("2 min");
		});
	});

	describe("formatTimeWithLabel", () => {
		it("returns human-readable h/m/s", () => {
			expect(formatTimeWithLabel(45)).toBe("45s");
			expect(formatTimeWithLabel(90)).toBe("1m 30s");
			expect(formatTimeWithLabel(3600)).toBe("1h");
		});
	});

	describe("getProgress", () => {
		it("returns percent elapsed", () => {
			expect(getProgress(100, 100)).toBe(0);
			expect(getProgress(100, 50)).toBe(50);
			expect(getProgress(100, 0)).toBe(100);
		});
	});

	describe("toastConfig", () => {
		it("enable/disable toggle specific toast types", () => {
			expect(toastConfig.enabled.start).toBe(false);
			toastConfig.enable("start");
			expect(toastConfig.enabled.start).toBe(true);
			toastConfig.disable("start");
			expect(toastConfig.enabled.start).toBe(false);
		});
	});

	describe("timerControls", () => {
		it("startTimer sets state to running", () => {
			const setState = jest.fn();
			timerControls.startTimer(setState);
			expect(setState).toHaveBeenCalledWith("running");
		});
		it("pauseTimer sets state to paused", () => {
			const setState = jest.fn();
			timerControls.pauseTimer(setState);
			expect(setState).toHaveBeenCalledWith("paused");
		});
		it("resetTimer sets state to idle and calls resetFn", () => {
			const setState = jest.fn();
			const resetFn = jest.fn();
			timerControls.resetTimer(setState, resetFn);
			expect(setState).toHaveBeenCalledWith("idle");
			expect(resetFn).toHaveBeenCalled();
		});
		it("stopTimer sets state to idle", () => {
			const setState = jest.fn();
			timerControls.stopTimer(setState);
			expect(setState).toHaveBeenCalledWith("idle");
		});
	});
});

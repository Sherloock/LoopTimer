import {
	createTimerExport,
	EXPORT_VERSION,
	exportTimerAsJSON,
	exportTimerAsJSONMinified,
} from "@/lib/export/timer-export";
import type { AdvancedConfig } from "@/types/advanced-timer";

const minimalConfig: AdvancedConfig = {
	items: [
		{
			id: "i1",
			name: "Work",
			duration: 30,
			type: "work",
		},
	],
};

describe("timer-export", () => {
	describe("createTimerExport", () => {
		it("returns object with version, exportedAt, timer", () => {
			const result = createTimerExport("My Timer", minimalConfig);
			expect(result.version).toBe(EXPORT_VERSION);
			expect(result.exportedAt).toBeDefined();
			expect(result.timer.name).toBe("My Timer");
			expect(result.timer.data).toEqual(minimalConfig);
		});
	});

	describe("exportTimerAsJSON", () => {
		it("returns pretty-printed JSON string", () => {
			const json = exportTimerAsJSON("T", minimalConfig);
			const parsed = JSON.parse(json);
			expect(parsed.timer.name).toBe("T");
			expect(json).toContain("\n");
		});
	});

	describe("exportTimerAsJSONMinified", () => {
		it("returns minified JSON without extra newlines", () => {
			const json = exportTimerAsJSONMinified("T", minimalConfig);
			const parsed = JSON.parse(json);
			expect(parsed.timer.name).toBe("T");
		});
	});
});

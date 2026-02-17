import {
	parseTimerFromJSON,
	validateTimerImport,
} from "@/lib/export/timer-import";

const validExport = {
	version: "1.0",
	exportedAt: new Date().toISOString(),
	timer: {
		name: "Test",
		data: {
			items: [
				{
					id: "i1",
					name: "Work",
					duration: 30,
					type: "work",
				},
			],
			colors: {
				prepare: "#fff",
				work: "#fff",
				rest: "#fff",
				loop: "#fff",
				nestedLoop: "#fff",
			},
			defaultAlarm: "none",
			speakNames: false,
		},
	},
};

describe("timer-import", () => {
	describe("validateTimerImport", () => {
		it("returns success and data for valid export", () => {
			const result = validateTimerImport(validExport);
			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
			expect(result.data!.timer.name).toBe("Test");
		});

		it("returns error for invalid structure", () => {
			const result = validateTimerImport({ foo: "bar" });
			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it("returns error for non-object", () => {
			const result = validateTimerImport(null);
			expect(result.success).toBe(false);
		});
	});

	describe("parseTimerFromJSON", () => {
		it("parses valid JSON string", () => {
			const result = parseTimerFromJSON(JSON.stringify(validExport));
			expect(result.success).toBe(true);
		});

		it("returns error for invalid JSON", () => {
			const result = parseTimerFromJSON("not json");
			expect(result.success).toBe(false);
			expect(result.error).toContain("JSON");
		});
	});
});

import {
	advancedConfigSchema,
	colorSettingsSchema,
	timerExportSchema,
	timerSchema,
} from "@/schema/timerSchema";
import { TEMPLATE_CATEGORIES } from "@/lib/constants/timers";

const validColors = {
	prepare: "#fff",
	work: "#fff",
	rest: "#fff",
	loop: "#fff",
	nestedLoop: "#fff",
};

const validInterval = {
	id: "i1",
	name: "Work",
	duration: 30,
	type: "work",
};

const validAdvancedConfig = {
	items: [validInterval],
	colors: validColors,
	defaultAlarm: "none",
	speakNames: false,
};

describe("timerSchema", () => {
	describe("colorSettingsSchema", () => {
		it("parses valid color object", () => {
			expect(colorSettingsSchema.parse(validColors)).toEqual(validColors);
		});
		it("rejects missing keys", () => {
			expect(() => colorSettingsSchema.parse({ prepare: "#fff" })).toThrow();
		});
	});

	describe("advancedConfigSchema", () => {
		it("parses valid config with interval", () => {
			expect(advancedConfigSchema.parse(validAdvancedConfig)).toEqual(
				validAdvancedConfig,
			);
		});
		it("parses config with single item", () => {
			expect(
				advancedConfigSchema.parse({
					...validAdvancedConfig,
					items: [validInterval],
				}).items,
			).toHaveLength(1);
		});
		it("rejects invalid duration", () => {
			expect(() =>
				advancedConfigSchema.parse({
					...validAdvancedConfig,
					items: [{ ...validInterval, duration: 0 }],
				}),
			).toThrow();
		});
	});

	describe("timerExportSchema", () => {
		it("parses valid export", () => {
			const data = {
				version: "1.0",
				exportedAt: new Date().toISOString(),
				timer: { name: "T", data: validAdvancedConfig },
			};
			expect(timerExportSchema.parse(data)).toEqual(data);
		});
		it("rejects invalid exportedAt datetime", () => {
			expect(() =>
				timerExportSchema.parse({
					version: "1.0",
					exportedAt: "not-a-datetime",
					timer: { name: "T", data: validAdvancedConfig },
				}),
			).toThrow();
		});
	});

	describe("timerSchema", () => {
		it("parses valid timer with name and data", () => {
			const input = {
				name: "My Timer",
				data: {},
			};
			expect(timerSchema.parse(input).name).toBe("My Timer");
		});
		it("rejects empty name", () => {
			expect(() => timerSchema.parse({ name: "", data: {} })).toThrow();
		});
		it("parses with optional category", () => {
			const input = {
				name: "T",
				data: {},
				category: TEMPLATE_CATEGORIES.HIIT,
			};
			expect(timerSchema.parse(input).category).toBe(TEMPLATE_CATEGORIES.HIIT);
		});
		it("rejects description over 500 chars", () => {
			expect(() =>
				timerSchema.parse({
					name: "T",
					data: {},
					description: "x".repeat(501),
				}),
			).toThrow();
		});
	});
});

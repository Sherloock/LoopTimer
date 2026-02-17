import {
	MAX_DURATION_SECONDS,
	MAX_LOOPS_PER_GROUP,
	MAX_WORKOUT_ITEMS,
	MIN_DURATION_SECONDS,
} from "@/lib/constants/ai";
import { validateAdvancedConfig } from "@/lib/ai/validate-workout";

const validInterval = {
	id: "i1",
	name: "Work",
	duration: 30,
	type: "work",
};

const validLoop = {
	id: "l1",
	loops: 2,
	items: [validInterval],
};

describe("validate-workout", () => {
	describe("validateAdvancedConfig", () => {
		it("returns valid for correct config with one interval", () => {
			const result = validateAdvancedConfig({
				items: [validInterval],
			});
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("returns valid for config with loop", () => {
			const result = validateAdvancedConfig({
				items: [validLoop],
			});
			expect(result.valid).toBe(true);
		});

		it("returns invalid when root is not an object", () => {
			const result = validateAdvancedConfig(null);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes("object"))).toBe(true);
		});

		it("returns invalid when items is missing or not array", () => {
			expect(validateAdvancedConfig({}).valid).toBe(false);
			expect(validateAdvancedConfig({ items: "x" }).valid).toBe(false);
		});

		it("returns invalid when items is empty", () => {
			const result = validateAdvancedConfig({ items: [] });
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.toLowerCase().includes("empty"))).toBe(
				true,
			);
		});

		it("returns invalid when items exceed MAX_WORKOUT_ITEMS", () => {
			const items = Array.from({ length: MAX_WORKOUT_ITEMS + 1 }, (_, i) => ({
				...validInterval,
				id: `i${i}`,
			}));
			const result = validateAdvancedConfig({ items });
			expect(result.valid).toBe(false);
		});

		it("returns invalid for interval with duration out of range", () => {
			const result = validateAdvancedConfig({
				items: [
					{
						...validInterval,
						duration: MIN_DURATION_SECONDS - 1,
					},
				],
			});
			expect(result.valid).toBe(false);
		});

		it("returns invalid for interval with duration > MAX_DURATION_SECONDS", () => {
			const result = validateAdvancedConfig({
				items: [
					{
						...validInterval,
						duration: MAX_DURATION_SECONDS + 1,
					},
				],
			});
			expect(result.valid).toBe(false);
		});

		it("returns invalid for interval with bad type", () => {
			const result = validateAdvancedConfig({
				items: [
					{
						...validInterval,
						type: "invalid",
					},
				],
			});
			expect(result.valid).toBe(false);
		});

		it("returns invalid for loop with loops > MAX_LOOPS_PER_GROUP", () => {
			const result = validateAdvancedConfig({
				items: [
					{
						...validLoop,
						loops: MAX_LOOPS_PER_GROUP + 1,
					},
				],
			});
			expect(result.valid).toBe(false);
		});
	});
});

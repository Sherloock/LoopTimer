import {
	calculateWorkoutGenerationCost,
	getPromptStats,
} from "@/lib/ai/cost-calculator";

describe("cost-calculator", () => {
	describe("calculateWorkoutGenerationCost", () => {
		it("returns token counts and cost breakdown", () => {
			const result = calculateWorkoutGenerationCost("30 min workout");
			expect(result.routerInputTokens).toBeGreaterThan(0);
			expect(result.workoutInputTokens).toBeGreaterThan(0);
			expect(result.totalInputTokens).toBe(
				result.routerInputTokens + result.workoutInputTokens,
			);
			expect(result.totalCost).toBeGreaterThanOrEqual(0);
			expect(result.costBreakdown).toContain("Router");
		});
	});

	describe("getPromptStats", () => {
		it("returns prompt lengths and token estimates", () => {
			const result = getPromptStats("5 exercises");
			expect(result.routerPromptLength).toBeGreaterThan(0);
			expect(result.workoutPromptLength).toBeGreaterThan(0);
			expect(result.totalCharacters).toBe(
				result.routerPromptLength + result.workoutPromptLength,
			);
			expect(result.totalTokens).toBeGreaterThan(0);
		});
	});
});

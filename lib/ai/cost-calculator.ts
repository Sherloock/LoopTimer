/**
 * AI cost calculation utilities for Groq API
 */

import { AI_MODEL } from "@/lib/constants/ai";
import { buildInitialPrompt, buildRouterPrompt } from "./workout-prompt";

// Groq pricing as of 2024 (USD per 1M tokens)
const GROQ_PRICING = {
	"llama-3.3-70b-versatile": {
		input: 0.59, // $0.59 per 1M input tokens
		output: 0.79, // $0.79 per 1M output tokens
	},
};

/**
 * Estimates token count from text
 * Rule of thumb: ~4 characters per token for English text
 */
function estimateTokens(text: string): number {
	return Math.ceil(text.length / 4);
}

/**
 * Calculates the cost of a single workout generation request
 */
export function calculateWorkoutGenerationCost(
	userPrompt: string = "30 minute workout with 5 exercises",
): {
	routerInputTokens: number;
	routerOutputTokens: number;
	workoutInputTokens: number;
	workoutOutputTokens: number;
	totalInputTokens: number;
	totalOutputTokens: number;
	routerCost: number;
	workoutCost: number;
	totalCost: number;
	costBreakdown: string;
} {
	const pricing = GROQ_PRICING[AI_MODEL as keyof typeof GROQ_PRICING];

	if (!pricing) {
		throw new Error(`Pricing not available for model: ${AI_MODEL}`);
	}

	// 1. Router prompt (intent classification)
	const routerPrompt = buildRouterPrompt(userPrompt);
	const routerInputTokens = estimateTokens(routerPrompt);
	const routerOutputTokens = 50; // Router returns small JSON (~50 tokens)

	// 2. Workout generation prompt
	const workoutPrompt = buildInitialPrompt(userPrompt);
	const workoutInputTokens = estimateTokens(workoutPrompt);
	const workoutOutputTokens = 1500; // Average workout JSON response (~1000-2000 tokens)

	// Total tokens
	const totalInputTokens = routerInputTokens + workoutInputTokens;
	const totalOutputTokens = routerOutputTokens + workoutOutputTokens;

	// Cost calculations (in USD)
	const routerCost =
		(routerInputTokens * pricing.input) / 1_000_000 +
		(routerOutputTokens * pricing.output) / 1_000_000;

	const workoutCost =
		(workoutInputTokens * pricing.input) / 1_000_000 +
		(workoutOutputTokens * pricing.output) / 1_000_000;

	const totalCost = routerCost + workoutCost;

	// Breakdown string
	const costBreakdown = `
Router Phase:
  Input:  ${routerInputTokens.toLocaleString()} tokens × $${pricing.input}/1M = $${((routerInputTokens * pricing.input) / 1_000_000).toFixed(6)}
  Output: ${routerOutputTokens.toLocaleString()} tokens × $${pricing.output}/1M = $${((routerOutputTokens * pricing.output) / 1_000_000).toFixed(6)}
  Subtotal: $${routerCost.toFixed(6)}

Workout Generation Phase:
  Input:  ${workoutInputTokens.toLocaleString()} tokens × $${pricing.input}/1M = $${((workoutInputTokens * pricing.input) / 1_000_000).toFixed(6)}
  Output: ${workoutOutputTokens.toLocaleString()} tokens × $${pricing.output}/1M = $${((workoutOutputTokens * pricing.output) / 1_000_000).toFixed(6)}
  Subtotal: $${workoutCost.toFixed(6)}

Total Cost Per Request: $${totalCost.toFixed(6)}

--- CONVERSIONS ---
Requests per $1.00: ${(1 / totalCost).toFixed(0)}
Requests per $10.00: ${(10 / totalCost).toFixed(0)}
Cost per 100 requests: $${(totalCost * 100).toFixed(2)}
Cost per 1,000 requests: $${(totalCost * 1000).toFixed(2)}
	`.trim();

	return {
		routerInputTokens,
		routerOutputTokens,
		workoutInputTokens,
		workoutOutputTokens,
		totalInputTokens,
		totalOutputTokens,
		routerCost,
		workoutCost,
		totalCost,
		costBreakdown,
	};
}

/**
 * Prints cost analysis to console
 */
export function printCostAnalysis(userPrompt?: string): void {
	const analysis = calculateWorkoutGenerationCost(userPrompt);

	console.log("\n=== AI WORKOUT GENERATION COST ANALYSIS ===\n");
	console.log(`Model: ${AI_MODEL}`);
	console.log(
		`Sample user prompt: "${userPrompt || "30 minute workout with 5 exercises"}"\n`,
	);
	console.log(analysis.costBreakdown);
	console.log("\n==========================================\n");
}

/**
 * Get prompt statistics
 */
export function getPromptStats(
	userPrompt: string = "30 minute workout with 5 exercises",
): {
	routerPromptLength: number;
	routerPromptTokens: number;
	workoutPromptLength: number;
	workoutPromptTokens: number;
	totalCharacters: number;
	totalTokens: number;
} {
	const routerPrompt = buildRouterPrompt(userPrompt);
	const workoutPrompt = buildInitialPrompt(userPrompt);

	return {
		routerPromptLength: routerPrompt.length,
		routerPromptTokens: estimateTokens(routerPrompt),
		workoutPromptLength: workoutPrompt.length,
		workoutPromptTokens: estimateTokens(workoutPrompt),
		totalCharacters: routerPrompt.length + workoutPrompt.length,
		totalTokens: estimateTokens(routerPrompt) + estimateTokens(workoutPrompt),
	};
}

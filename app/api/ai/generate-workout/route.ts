import { checkAuth } from "@/actions/auth/authCheck";
import { validateAdvancedConfig } from "@/lib/ai/validate-workout";
import {
	buildInitialPrompt,
	buildRetryPrompt,
	buildRouterPrompt,
} from "@/lib/ai/workout-prompt";
import { AI_MAX_RETRIES, AI_MODEL, AI_TIMEOUT_MS } from "@/lib/constants/ai";
import type { AdvancedConfig } from "@/types/advanced-timer";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
});

interface GenerateWorkoutRequest {
	prompt: string;
	currentConfig?: AdvancedConfig;
}

/**
 * Extracts JSON from AI response, handling markdown code blocks
 */
function extractJson(text: string): string {
	// Remove markdown code blocks if present
	const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (codeBlockMatch) {
		return codeBlockMatch[1].trim();
	}
	return text.trim();
}

interface GroqUsage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
}

interface GroqResponse {
	content: string;
	usage: GroqUsage;
}

// Groq pricing (USD per 1M tokens)
const GROQ_PRICING = {
	"llama-3.3-70b-versatile": {
		input: 0.59,
		output: 0.79,
	},
};

/**
 * Calculates cost from token usage
 */
function calculateCost(usage: GroqUsage): number {
	const pricing =
		GROQ_PRICING[AI_MODEL as keyof typeof GROQ_PRICING] ||
		GROQ_PRICING["llama-3.3-70b-versatile"];
	const inputCost = (usage.prompt_tokens * pricing.input) / 1_000_000;
	const outputCost = (usage.completion_tokens * pricing.output) / 1_000_000;
	return inputCost + outputCost;
}

/**
 * Calls Groq API with timeout and returns content + usage stats
 */
async function callGroqWithTimeout(
	prompt: string,
	timeoutMs: number,
): Promise<GroqResponse> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const completion = await groq.chat.completions.create(
			{
				messages: [
					{
						role: "user",
						content: prompt,
					},
				],
				model: AI_MODEL,
				temperature: 0.3,
				max_tokens: 4096,
			},
			{
				signal: controller.signal,
			},
		);

		clearTimeout(timeoutId);

		const content = completion.choices[0]?.message?.content;
		if (!content) {
			throw new Error("No content in AI response");
		}

		const usage: GroqUsage = {
			prompt_tokens: completion.usage?.prompt_tokens || 0,
			completion_tokens: completion.usage?.completion_tokens || 0,
			total_tokens: completion.usage?.total_tokens || 0,
		};

		return { content, usage };
	} catch (error) {
		clearTimeout(timeoutId);
		if ((error as Error).name === "AbortError") {
			throw new Error("AI request timed out");
		}
		throw error;
	}
}

export async function POST(req: Request) {
	try {
		// Check authentication
		const userId = await checkAuth();

		// Parse request body
		const body = (await req.json()) as GenerateWorkoutRequest;
		const { prompt, currentConfig } = body;

		if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
			return NextResponse.json(
				{ error: "Prompt is required" },
				{ status: 400 },
			);
		}

		// Sanitize prompt (basic XSS prevention)
		const sanitizedPrompt = prompt.trim().slice(0, 1000);

		let totalCost = 0;

		// Step 1: Use AI router to validate exercise intent
		try {
			const routerPrompt = buildRouterPrompt(sanitizedPrompt);
			const routerResponse = await callGroqWithTimeout(
				routerPrompt,
				AI_TIMEOUT_MS,
			);

			// Calculate and log router cost
			const routerCost = calculateCost(routerResponse.usage);
			totalCost += routerCost;
			console.log(
				`[AI Router] Tokens: ${routerResponse.usage.prompt_tokens} input + ${routerResponse.usage.completion_tokens} output = ${routerResponse.usage.total_tokens} total | Cost: $${routerCost.toFixed(6)}`,
			);

			// Parse router response
			const routerJsonString = extractJson(routerResponse.content);
			let routerResult: { isExerciseRelated: boolean; reason: string };

			try {
				routerResult = JSON.parse(routerJsonString);
			} catch {
				// If router fails to parse, allow through (fail-open for edge cases)
				console.warn("Router response parsing failed, allowing prompt through");
				routerResult = { isExerciseRelated: true, reason: "Parser fallback" };
			}

			// If not exercise-related, reject immediately
			if (!routerResult.isExerciseRelated) {
				console.log(
					`[AI Router] Rejected non-exercise prompt. Total cost: $${totalCost.toFixed(6)}`,
				);
				return NextResponse.json(
					{
						error: "Invalid prompt: not exercise-related",
						message:
							routerResult.reason ||
							"Your request doesn't appear to be about workouts or exercises. Please describe a workout, exercise routine, stretch session, or training plan.",
					},
					{ status: 400 },
				);
			}
		} catch (error) {
			// If router fails, log but allow through (fail-open)
			console.warn("Router check failed:", error);
		}

		let lastInvalidJson = "";
		let lastErrors: string[] = [];

		// Retry loop with detailed feedback
		for (let attempt = 1; attempt <= AI_MAX_RETRIES; attempt++) {
			try {
				// Build appropriate prompt
				const fullPrompt =
					attempt === 1
						? buildInitialPrompt(sanitizedPrompt, currentConfig)
						: buildRetryPrompt(
								sanitizedPrompt,
								lastInvalidJson,
								lastErrors,
								attempt,
							);

				// Call Groq API
				const aiResponse = await callGroqWithTimeout(fullPrompt, AI_TIMEOUT_MS);

				// Calculate and log workout generation cost
				const workoutCost = calculateCost(aiResponse.usage);
				totalCost += workoutCost;
				console.log(
					`[AI Workout Gen - Attempt ${attempt}] Tokens: ${aiResponse.usage.prompt_tokens} input + ${aiResponse.usage.completion_tokens} output = ${aiResponse.usage.total_tokens} total | Cost: $${workoutCost.toFixed(6)}`,
				);

				// Extract JSON from response
				const jsonString = extractJson(aiResponse.content);
				lastInvalidJson = jsonString;

				// Parse JSON
				let parsedConfig: unknown;
				try {
					parsedConfig = JSON.parse(jsonString);
				} catch (parseError) {
					lastErrors = [
						`Invalid JSON syntax: ${(parseError as Error).message}`,
					];
					if (attempt === AI_MAX_RETRIES) {
						console.log(
							`[AI Workout Gen] Failed after ${attempt} attempts. Total cost: $${totalCost.toFixed(6)}`,
						);
						return NextResponse.json(
							{
								error: "Failed to generate valid JSON after maximum retries",
								details: lastErrors,
								attempt,
								invalidJson: lastInvalidJson,
							},
							{ status: 400 },
						);
					}
					console.log(
						`[AI Workout Gen - Attempt ${attempt}] JSON parse failed, retrying...`,
					);
					continue; // Retry
				}

				// Validate against schema
				const validation = validateAdvancedConfig(parsedConfig);

				if (validation.valid) {
					// Success!
					console.log(
						`[AI Workout Gen] ✅ SUCCESS! Generated workout in ${attempt} attempt(s). Total cost: $${totalCost.toFixed(6)} (~${Math.floor(1 / totalCost)} requests per $1)`,
					);
					return NextResponse.json({
						config: parsedConfig as AdvancedConfig,
						attempt,
					});
				}

				// Validation failed, prepare for retry
				lastErrors = validation.errors;

				if (attempt === AI_MAX_RETRIES) {
					// Max retries reached
					console.log(
						`[AI Workout Gen] Validation failed after ${attempt} attempts. Total cost: $${totalCost.toFixed(6)}`,
					);
					return NextResponse.json(
						{
							error:
								"Generated workout failed validation after maximum retries",
							details: lastErrors,
							attempt,
							invalidJson: lastInvalidJson,
						},
						{ status: 400 },
					);
				}

				console.log(
					`[AI Workout Gen - Attempt ${attempt}] Validation failed, retrying...`,
				);
				// Continue to next retry
			} catch (error) {
				// Handle API errors
				if (attempt === AI_MAX_RETRIES) {
					console.log(
						`[AI Workout Gen] API error after ${attempt} attempts. Total cost: $${totalCost.toFixed(6)}`,
					);
					return NextResponse.json(
						{
							error: "AI generation failed",
							details: [(error as Error).message],
							attempt,
						},
						{ status: 500 },
					);
				}
				// Retry on error
				console.log(
					`[AI Workout Gen - Attempt ${attempt}] API error, retrying...`,
				);
				lastErrors = [(error as Error).message];
			}
		}

		// Should not reach here, but just in case
		console.log(
			`[AI Workout Gen] Unexpected error. Total cost: $${totalCost.toFixed(6)}`,
		);
		return NextResponse.json(
			{
				error: "Unexpected error during workout generation",
				details: lastErrors,
			},
			{ status: 500 },
		);
	} catch (error) {
		console.error("[AI Workout Gen] Fatal error:", error);
		return NextResponse.json(
			{ error: "Internal server error", details: [(error as Error).message] },
			{ status: 500 },
		);
	}
}

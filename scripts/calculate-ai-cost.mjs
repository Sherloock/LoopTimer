/**
 * Script to calculate AI workout generation costs
 * Run with: node scripts/calculate-ai-cost.mjs
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the prompt file to get actual character counts
const promptFilePath = join(__dirname, "..", "lib", "ai", "workout-prompt.ts");
const promptFile = readFileSync(promptFilePath, "utf-8");

// Extract the SCHEMA_SPECIFICATION and EXAMPLES constants
const schemaMatch = promptFile.match(
	/const SCHEMA_SPECIFICATION = `([\s\S]*?)`;/,
);
const examplesMatch = promptFile.match(/const EXAMPLES = `([\s\S]*?)`;/);
const initialPromptMatch = promptFile.match(
	/export function buildInitialPrompt[\s\S]*?return `([\s\S]*?)`;[\s\S]*?}/,
);
const routerPromptMatch = promptFile.match(
	/export function buildRouterPrompt[\s\S]*?return `([\s\S]*?)`;[\s\S]*?}/,
);

const schemaLength = schemaMatch ? schemaMatch[1].length : 0;
const examplesLength = examplesMatch ? examplesMatch[1].length : 0;
const routerPromptTemplate = routerPromptMatch ? routerPromptMatch[1] : "";
const workoutPromptTemplate = initialPromptMatch ? initialPromptMatch[1] : "";

// Sample user prompt
const sampleUserPrompt = "30 minute workout with 5 exercises";

// Calculate router prompt
const routerPrompt = routerPromptTemplate.replace(
	"${userPrompt}",
	sampleUserPrompt,
);
const routerPromptLength = routerPrompt.length;
const routerPromptTokens = Math.ceil(routerPromptLength / 4);

// Calculate workout generation prompt (includes schema + examples)
const workoutPromptLength =
	workoutPromptTemplate.length + schemaLength + examplesLength;
const workoutPromptTokens = Math.ceil(workoutPromptLength / 4);

// Model pricing (Groq llama-3.3-70b-versatile)
const INPUT_PRICE = 0.59; // $0.59 per 1M tokens
const OUTPUT_PRICE = 0.79; // $0.79 per 1M tokens

// Estimate output tokens
const ROUTER_OUTPUT_TOKENS = 50; // Small JSON response
const WORKOUT_OUTPUT_TOKENS = 1500; // Average workout JSON

// Calculate costs
const routerInputCost = (routerPromptTokens * INPUT_PRICE) / 1_000_000;
const routerOutputCost = (ROUTER_OUTPUT_TOKENS * OUTPUT_PRICE) / 1_000_000;
const routerTotalCost = routerInputCost + routerOutputCost;

const workoutInputCost = (workoutPromptTokens * INPUT_PRICE) / 1_000_000;
const workoutOutputCost = (WORKOUT_OUTPUT_TOKENS * OUTPUT_PRICE) / 1_000_000;
const workoutTotalCost = workoutInputCost + workoutOutputCost;

const totalCost = routerTotalCost + workoutTotalCost;
const requestsPer1USD = Math.floor(1 / totalCost);
const requestsPer10USD = Math.floor(10 / totalCost);

// Print results
console.log("\n========================================");
console.log("  AI WORKOUT GENERATION COST ANALYSIS");
console.log("========================================\n");

console.log("Model: llama-3.3-70b-versatile (Groq)");
console.log(
	`Pricing: $${INPUT_PRICE}/1M input tokens, $${OUTPUT_PRICE}/1M output tokens\n`,
);

console.log("--- PROMPT SIZES ---");
console.log(
	`Router prompt:         ${routerPromptLength.toLocaleString()} chars (~${routerPromptTokens.toLocaleString()} tokens)`,
);
console.log(
	`Workout prompt:        ${workoutPromptLength.toLocaleString()} chars (~${workoutPromptTokens.toLocaleString()} tokens)`,
);
console.log(
	`Total input per request: ${(routerPromptTokens + workoutPromptTokens).toLocaleString()} tokens\n`,
);

console.log("--- ROUTER PHASE ---");
console.log(
	`Input:  ${routerPromptTokens.toLocaleString()} tokens × $${INPUT_PRICE}/1M = $${routerInputCost.toFixed(6)}`,
);
console.log(
	`Output: ${ROUTER_OUTPUT_TOKENS} tokens × $${OUTPUT_PRICE}/1M = $${routerOutputCost.toFixed(6)}`,
);
console.log(`Subtotal: $${routerTotalCost.toFixed(6)}\n`);

console.log("--- WORKOUT GENERATION PHASE ---");
console.log(
	`Input:  ${workoutPromptTokens.toLocaleString()} tokens × $${INPUT_PRICE}/1M = $${workoutInputCost.toFixed(6)}`,
);
console.log(
	`Output: ${WORKOUT_OUTPUT_TOKENS.toLocaleString()} tokens × $${OUTPUT_PRICE}/1M = $${workoutOutputCost.toFixed(6)}`,
);
console.log(`Subtotal: $${workoutTotalCost.toFixed(6)}\n`);

console.log("========================================");
console.log(`TOTAL COST PER REQUEST: $${totalCost.toFixed(6)}`);
console.log("========================================\n");

console.log("--- VOLUME CALCULATIONS ---");
console.log(`✨ Requests per $1.00:    ${requestsPer1USD.toLocaleString()}`);
console.log(`✨ Requests per $10.00:   ${requestsPer10USD.toLocaleString()}`);
console.log(`💰 Cost per 100 requests:  $${(totalCost * 100).toFixed(2)}`);
console.log(`💰 Cost per 1,000 requests: $${(totalCost * 1000).toFixed(2)}`);
console.log(
	`💰 Cost per 10,000 requests: $${(totalCost * 10000).toFixed(2)}\n`,
);

console.log("Note: Estimates based on ~4 chars per token.");
console.log("Actual costs may vary based on tokenization.\n");

import type { AdvancedConfig } from "@/types/advanced-timer";
import {
	MAX_DURATION_SECONDS,
	MAX_LOOPS_PER_GROUP,
	MIN_DURATION_SECONDS,
} from "@/lib/constants/ai";

const SCHEMA_SPECIFICATION = `
## JSON Schema for AdvancedConfig

The output MUST be a valid JSON object matching this exact structure:

\`\`\`typescript
interface AdvancedConfig {
  items: WorkoutItem[];
  colors: ColorSettings;
  defaultAlarm: string;
  speakNames: boolean;
}

type WorkoutItem = IntervalStep | LoopGroup;

interface IntervalStep {
  id: string;              // Unique identifier (e.g., "1", "2", "3")
  name: string;            // Display name (e.g., "WARM UP", "SQUATS")
  duration: number;        // Duration in seconds (${MIN_DURATION_SECONDS}-${MAX_DURATION_SECONDS})
  type: "prepare" | "work" | "rest";  // Interval type
  color?: string;          // Optional hex color (e.g., "#FF0000")
  skipOnLastLoop?: boolean; // Optional: skip this on last loop iteration
  sound?: string;          // Optional: sound identifier
}

interface LoopGroup {
  id: string;              // Unique identifier
  loops: number;           // Number of repetitions (1-${MAX_LOOPS_PER_GROUP})
  items: WorkoutItem[];    // Nested intervals or loops
  collapsed?: boolean;     // Optional: UI state
  color?: string;          // Optional hex color
}

interface ColorSettings {
  prepare: string;         // Hex color for prepare intervals
  work: string;            // Hex color for work intervals
  rest: string;            // Hex color for rest intervals
  loop: string;            // Hex color for loops
  nestedLoop: string;      // Hex color for nested loops
}
\`\`\`

## Validation Rules

1. **Required fields**: items, colors, defaultAlarm, speakNames
2. **items**: Must be a non-empty array of WorkoutItem objects
3. **colors**: Must include all 5 color properties (prepare, work, rest, loop, nestedLoop) as valid hex colors
4. **defaultAlarm**: Must be a non-empty string (e.g., "beep-1x", "beep-2x", "beep-3x")
5. **speakNames**: Must be a boolean
6. **IntervalStep.duration**: Must be a number between ${MIN_DURATION_SECONDS} and ${MAX_DURATION_SECONDS}
7. **IntervalStep.type**: Must be exactly "prepare", "work", or "rest"
8. **LoopGroup.loops**: Must be a number between 1 and ${MAX_LOOPS_PER_GROUP}
9. **LoopGroup.items**: Must be a non-empty array
10. **All IDs**: Must be unique strings
11. **Colors**: Must be valid hex format (e.g., "#FF0000" or "#F00")

## Default Values

Use these defaults when not specified by user:
- colors.prepare: "#3b82f6" (blue)
- colors.work: "#ef4444" (red)
- colors.rest: "#22c55e" (green)
- colors.loop: "#8b5cf6" (purple)
- colors.nestedLoop: "#ec4899" (pink)
- defaultAlarm: "beep-2x"
- speakNames: true
`;

const EXAMPLES = `
## Valid Examples

### Example 1: Simple workout
\`\`\`json
{
  "items": [
    {
      "id": "1",
      "name": "WARM UP",
      "duration": 10,
      "type": "prepare"
    },
    {
      "id": "2",
      "loops": 3,
      "items": [
        {
          "id": "3",
          "name": "PUSH UPS",
          "duration": 30,
          "type": "work"
        },
        {
          "id": "4",
          "name": "REST",
          "duration": 15,
          "type": "rest"
        }
      ]
    }
  ],
  "colors": {
    "prepare": "#3b82f6",
    "work": "#ef4444",
    "rest": "#22c55e",
    "loop": "#8b5cf6",
    "nestedLoop": "#ec4899"
  },
  "defaultAlarm": "beep-2x",
  "speakNames": true
}
\`\`\`

### Example 2: Complex nested workout
\`\`\`json
{
  "items": [
    {
      "id": "1",
      "name": "PREPARE",
      "duration": 5,
      "type": "prepare"
    },
    {
      "id": "2",
      "loops": 2,
      "items": [
        {
          "id": "3",
          "name": "SQUATS",
          "duration": 45,
          "type": "work"
        },
        {
          "id": "4",
          "name": "REST",
          "duration": 20,
          "type": "rest"
        },
        {
          "id": "5",
          "loops": 3,
          "items": [
            {
              "id": "6",
              "name": "LUNGES",
              "duration": 30,
              "type": "work"
            },
            {
              "id": "7",
              "name": "QUICK REST",
              "duration": 10,
              "type": "rest"
            }
          ]
        }
      ]
    }
  ],
  "colors": {
    "prepare": "#3b82f6",
    "work": "#ef4444",
    "rest": "#22c55e",
    "loop": "#8b5cf6",
    "nestedLoop": "#ec4899"
  },
  "defaultAlarm": "beep-2x",
  "speakNames": true
}
\`\`\`
`;

/**
 * Builds the initial prompt for first generation attempt
 */
export function buildInitialPrompt(
	userPrompt: string,
	currentConfig?: AdvancedConfig,
): string {
	const currentStateSection = currentConfig
		? `
## Current Workout State

The user is currently editing this workout:
\`\`\`json
${JSON.stringify(currentConfig, null, 2)}
\`\`\`

Preserve the structure and modify according to the user's request.
`
		: "";

	return `You are a workout timer generator AI. Your task is to generate a valid JSON configuration for a workout timer based on the user's natural language request.

${SCHEMA_SPECIFICATION}

${EXAMPLES}

${currentStateSection}

## User Request

"${userPrompt}"

## Instructions

1. Analyze the user's request carefully
2. Generate a workout timer configuration that matches their intent
3. Use appropriate exercise names, durations, and structure
4. Ensure all IDs are unique strings (use sequential numbers: "1", "2", "3", etc.)
5. Use "prepare" type for warm-up/preparation phases
6. Use "work" type for exercise/activity phases
7. Use "rest" type for rest/recovery phases
8. Use loops for repeated sequences
9. Return ONLY the valid JSON object, no markdown code blocks, no explanations, no additional text

Generate the workout configuration now:`;
}

/**
 * Builds a retry prompt with detailed error feedback
 */
export function buildRetryPrompt(
	userPrompt: string,
	invalidJson: string,
	errors: string[],
	attempt: number,
): string {
	return `RETRY ATTEMPT ${attempt}/3

Your previous response failed validation. Please fix the following issues:

## Original User Request

"${userPrompt}"

## Your Previous Invalid JSON

\`\`\`json
${invalidJson}
\`\`\`

## Validation Errors

${errors.map((err, idx) => `${idx + 1}. ${err}`).join("\n")}

## Correction Instructions

Generate a corrected JSON that fixes these exact issues while maintaining the user's intent.
Follow the schema specification below:

${SCHEMA_SPECIFICATION}

${EXAMPLES}

## Critical Requirements

1. Fix ALL validation errors listed above
2. Ensure all required fields are present
3. Ensure all data types are correct (numbers as numbers, not strings)
4. Ensure all IDs are unique strings
5. Ensure colors are valid hex format
6. Ensure durations are between ${MIN_DURATION_SECONDS} and ${MAX_DURATION_SECONDS} seconds
7. Ensure loop counts are between 1 and ${MAX_LOOPS_PER_GROUP}
8. Return ONLY valid JSON, no markdown code blocks, no explanations, no additional text

Generate the corrected workout configuration now:`;
}

import {
	MAX_DURATION_SECONDS,
	MAX_LOOPS_PER_GROUP,
	MIN_DURATION_SECONDS,
} from "@/lib/constants/ai";
import type { AdvancedConfig } from "@/types/advanced-timer";

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

### Example 3: Comprehensive stretch routine with multiple exercises and loops
\`\`\`json
{
  "items": [
    {
      "id": "1",
      "name": "Warm up",
      "type": "work",
      "duration": 180
    },
    {
      "id": "2",
      "name": "hipflexor",
      "items": [
        {
          "id": "3",
          "name": "hipflexor",
          "type": "work",
          "duration": 30
        },
        {
          "id": "4",
          "name": "REST",
          "type": "rest",
          "duration": 15,
          "skipOnLastLoop": false
        }
      ],
      "loops": 6,
      "collapsed": false
    },
    {
      "id": "5",
      "name": "To knee",
      "items": [
        {
          "id": "6",
          "name": "To knee",
          "type": "work",
          "duration": 30
        },
        {
          "id": "7",
          "name": "REST",
          "type": "rest",
          "duration": 15,
          "skipOnLastLoop": false
        }
      ],
      "loops": 3,
      "collapsed": false
    },
    {
      "id": "8",
      "name": "hipflexor",
      "items": [
        {
          "id": "9",
          "name": "Piegon",
          "type": "work",
          "duration": 30
        },
        {
          "id": "10",
          "name": "REST",
          "type": "rest",
          "duration": 15,
          "skipOnLastLoop": false
        }
      ],
      "loops": 6,
      "collapsed": false
    },
    {
      "id": "11",
      "name": "To knee",
      "items": [
        {
          "id": "12",
          "name": "lat stretch",
          "type": "work",
          "duration": 30
        },
        {
          "id": "13",
          "name": "REST or cat",
          "type": "rest",
          "duration": 15,
          "skipOnLastLoop": false
        }
      ],
      "loops": 3,
      "collapsed": false
    },
    {
      "id": "14",
      "name": "hipflexor",
      "items": [
        {
          "id": "15",
          "name": "sideway2, behind2, latside2",
          "type": "work",
          "duration": 30
        },
        {
          "id": "16",
          "name": "REST",
          "type": "rest",
          "duration": 7,
          "skipOnLastLoop": false
        }
      ],
      "loops": 6,
      "collapsed": false
    },
    {
      "id": "17",
      "name": "To knee",
      "items": [
        {
          "id": "18",
          "name": "suppine twist",
          "type": "work",
          "duration": 30
        },
        {
          "id": "19",
          "name": "REST",
          "type": "rest",
          "duration": 15,
          "skipOnLastLoop": false
        }
      ],
      "loops": 2,
      "collapsed": false
    },
    {
      "id": "20",
      "name": "hipflexor",
      "items": [
        {
          "id": "21",
          "name": "90 - 90 alter",
          "type": "work",
          "duration": 30
        },
        {
          "id": "22",
          "name": "REST",
          "type": "rest",
          "duration": 10,
          "skipOnLastLoop": false
        }
      ],
      "loops": 6,
      "collapsed": false
    },
    {
      "id": "23",
      "name": "hipflexor",
      "items": [
        {
          "id": "24",
          "name": "PREPARE",
          "type": "prepare",
          "duration": 10
        },
        {
          "id": "25",
          "name": "front split",
          "type": "work",
          "duration": 30
        },
        {
          "id": "26",
          "name": "REST",
          "type": "rest",
          "duration": 30,
          "skipOnLastLoop": true
        }
      ],
      "loops": 4,
      "collapsed": false
    }
  ],
  "colors": {
    "loop": "#8b5cf6",
    "rest": "#3b82f6",
    "work": "#22c55e",
    "prepare": "#f97316",
    "nestedLoop": "#f59e0b"
  },
  "speakNames": true,
  "defaultAlarm": "beep-3x"
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

## Language Support

You MUST understand and process requests in MULTIPLE languages, including:
- English
- Hungarian (Magyar)
- Other languages as needed

When the user requests a workout in Hungarian (e.g., "fájt a medencém és összesn egy laza 20perces nyújtást szeretnék naponta kb 6 gyakorlattal"), translate the intent and generate appropriate exercises. The user wants: "my hip hurt and I want a relaxed 20-minute stretch daily with about 6 exercises" - generate multiple stretch exercises with loops.

${SCHEMA_SPECIFICATION}

${EXAMPLES}

${currentStateSection}

## User Request

"${userPrompt}"

## Instructions

1. **Analyze the user's request carefully** - Understand the language, intent, duration, exercise count, and intensity level
2. **Generate multiple exercises when requested** - If the user asks for "6 exercises" or "multiple stretches", create multiple loop groups, each representing a different exercise
3. **Use loops appropriately** - For stretches and repeated exercises, create LoopGroups with work/rest pairs. Each exercise should typically be its own LoopGroup with appropriate loop count (3-6 loops for stretches, adjust based on duration)
4. **Structure stretches properly**:
   - Start with a warm-up interval if appropriate (type: "prepare" or "work")
   - Create separate LoopGroups for each stretch exercise
   - Each LoopGroup should contain: work interval (the stretch) + rest interval
   - Use skipOnLastLoop: true for final rest periods when appropriate
   - Use skipOnLastLoop: false for rest periods between repetitions
5. **Calculate total duration** - If user specifies total duration (e.g., "20 minutes"), distribute it across all exercises and loops
6. **Exercise naming** - Use descriptive names for exercises. For stretches, use common names (e.g., "hipflexor", "pigeon pose", "lat stretch", "90-90 stretch")
7. **Ensure all IDs are unique strings** - Use sequential numbers: "1", "2", "3", etc.
8. **Use "prepare" type** for warm-up/preparation phases
9. **Use "work" type** for exercise/activity phases (including stretches)
10. **Use "rest" type** for rest/recovery phases between exercises
11. **Return ONLY the valid JSON object** - No markdown code blocks, no explanations, no additional text

## Key Patterns for Stretch Routines

- **Multiple exercises**: Create multiple LoopGroups at the root level, each with a descriptive name
- **Work/Rest pairs**: Each LoopGroup typically contains [work, rest] sequence
- **Loop counts**: For stretches, use 3-6 loops per exercise depending on total duration
- **Rest durations**: 10-30 seconds for stretches, adjust based on intensity
- **Work durations**: 20-60 seconds for stretches, adjust based on exercise type

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

## Language Support

You MUST understand and process requests in MULTIPLE languages, including:
- English
- Hungarian (Magyar)
- Other languages as needed

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
8. If the user requested multiple exercises (e.g., "6 exercises"), create multiple LoopGroups
9. For stretches, structure each exercise as a LoopGroup with work/rest pairs
10. Return ONLY valid JSON, no markdown code blocks, no explanations, no additional text

Generate the corrected workout configuration now:`;
}

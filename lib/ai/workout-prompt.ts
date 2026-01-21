import {
	MAX_DURATION_SECONDS,
	MAX_LOOPS_PER_GROUP,
	MIN_DURATION_SECONDS,
} from "@/lib/constants/ai";
import type { AdvancedConfig } from "@/types/advanced-timer";

/**
 * Builds a prompt for the AI router to determine if a query is exercise-related
 */
export function buildRouterPrompt(userPrompt: string): string {
	return `You are a workout intent classifier. Your ONLY job is to determine if a user's request is about creating a workout, exercise routine, stretch session, or training timer.

Analyze this user request:
"${userPrompt}"

Respond with ONLY a JSON object in this exact format:
{
  "isExerciseRelated": true/false,
  "reason": "brief explanation"
}

Examples of VALID exercise-related requests:
- "30 minute HIIT workout"
- "stretching routine for my hips"
- "strength training with 5 exercises"
- "create a yoga session"
- "fájt a medencém és szeretnék nyújtani" (Hungarian: my hip hurts and I want to stretch)
- "1 hour full body workout"
- "cardio circuit training"

Examples of INVALID non-exercise requests:
- "What's the weather?"
- "Tell me a joke"
- "How do I cook pasta?"
- "Calculate 2+2"
- "Write me a story"

Set "isExerciseRelated" to true ONLY if the request is clearly about workouts, exercises, stretching, training, or fitness timers.
If unclear or unrelated, set it to false and explain why in the "reason" field.

Respond now:`;
}

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

**ALWAYS use these default colors in the ColorSettings object:**
- colors.prepare: "#f97316" (orange) - for warm-up/preparation intervals
- colors.work: "#22c55e" (green) - for work/exercise intervals
- colors.rest: "#3b82f6" (blue) - for rest intervals
- colors.loop: "#8b5cf6" (purple) - for loop groups
- colors.nestedLoop: "#f59e0b" (amber) - for nested loops

**Color Usage Rules:**
- **DO NOT** add a \`color\` field to individual IntervalStep items unless you need to override the default
- Individual intervals will automatically use the appropriate color from ColorSettings based on their \`type\`:
  - \`type: "prepare"\` → uses colors.prepare
  - \`type: "work"\` → uses colors.work
  - \`type: "rest"\` → uses colors.rest
- Only add \`color\` to an IntervalStep if you need a specific color different from the default
- LoopGroups can optionally have a \`color\` field to override colors.loop

**Other defaults:**
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
    "prepare": "#f97316",
    "work": "#22c55e",
    "rest": "#3b82f6",
    "loop": "#8b5cf6",
    "nestedLoop": "#f59e0b"
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
    "prepare": "#f97316",
    "work": "#22c55e",
    "rest": "#3b82f6",
    "loop": "#8b5cf6",
    "nestedLoop": "#f59e0b"
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

### Example 4: 60-minute full-body strength workout (Duration calculation demonstration)
\`\`\`json
{
  "items": [
    {
      "id": "1",
      "name": "Warm-up",
      "type": "prepare",
      "duration": 600
    },
    {
      "id": "2",
      "items": [
        {
          "id": "3",
          "name": "Push-ups",
          "type": "work",
          "duration": 45
        },
        {
          "id": "4",
          "name": "REST",
          "type": "rest",
          "duration": 30
        }
      ],
      "loops": 4
    },
    {
      "id": "5",
      "items": [
        {
          "id": "6",
          "name": "Squats",
          "type": "work",
          "duration": 45
        },
        {
          "id": "7",
          "name": "REST",
          "type": "rest",
          "duration": 30
        }
      ],
      "loops": 4
    },
    {
      "id": "8",
      "items": [
        {
          "id": "9",
          "name": "Plank",
          "type": "work",
          "duration": 60
        },
        {
          "id": "10",
          "name": "REST",
          "type": "rest",
          "duration": 30
        }
      ],
      "loops": 3
    },
    {
      "id": "11",
      "items": [
        {
          "id": "12",
          "name": "Lunges",
          "type": "work",
          "duration": 45
        },
        {
          "id": "13",
          "name": "REST",
          "type": "rest",
          "duration": 30
        }
      ],
      "loops": 4
    },
    {
      "id": "14",
      "items": [
        {
          "id": "15",
          "name": "Mountain climbers",
          "type": "work",
          "duration": 40
        },
        {
          "id": "16",
          "name": "REST",
          "type": "rest",
          "duration": 30
        }
      ],
      "loops": 4
    },
    {
      "id": "17",
      "items": [
        {
          "id": "18",
          "name": "Burpees",
          "type": "work",
          "duration": 40
        },
        {
          "id": "19",
          "name": "REST",
          "type": "rest",
          "duration": 30
        }
      ],
      "loops": 4
    },
    {
      "id": "20",
      "items": [
        {
          "id": "21",
          "name": "Pull-ups",
          "type": "work",
          "duration": 30
        },
        {
          "id": "22",
          "name": "REST",
          "type": "rest",
          "duration": 30
        }
      ],
      "loops": 5
    },
    {
      "id": "23",
      "items": [
        {
          "id": "24",
          "name": "Russian twists",
          "type": "work",
          "duration": 45
        },
        {
          "id": "25",
          "name": "REST",
          "type": "rest",
          "duration": 30
        }
      ],
      "loops": 3
    },
    {
      "id": "26",
      "name": "Cool-down stretch",
      "type": "rest",
      "duration": 300
    }
  ],
  "colors": {
    "prepare": "#f97316",
    "work": "#22c55e",
    "rest": "#3b82f6",
    "loop": "#8b5cf6",
    "nestedLoop": "#f59e0b"
  },
  "defaultAlarm": "beep-2x",
  "speakNames": true
}
\`\`\`
Duration calculation: 600 + 4×(45+30) + 4×(45+30) + 3×(60+30) + 4×(45+30) + 4×(40+30) + 4×(40+30) + 5×(30+30) + 3×(45+30) + 300 = 600 + 300 + 300 + 270 + 300 + 280 + 280 + 300 + 225 + 300 = 3155 seconds ≈ 52.6 minutes. This needs adjustment for exactly 60 minutes!
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

## CRITICAL: Exercise Selection Guidelines

You MUST choose exercises that match the workout type requested. Here are the exercise categories:

### Strength Training Exercises
- **Upper body**: Push-ups, pull-ups, dips, bench press, shoulder press, rows, bicep curls, tricep extensions
- **Lower body**: Squats, lunges, deadlifts, leg press, calf raises, leg curls, leg extensions
- **Core**: Planks, crunches, Russian twists, mountain climbers, leg raises, bicycle crunches

### Cardio/HIIT Exercises
- **High intensity**: Burpees, jumping jacks, high knees, mountain climbers, jump squats, box jumps
- **Medium intensity**: Jogging in place, skipping, step-ups, jumping rope, shadow boxing

### Stretch/Flexibility Exercises
- **Hip & Lower body**: Hip flexor stretch, pigeon pose, butterfly stretch, seated forward fold, 90-90 stretch, supine twist, frog stretch
  - **Unilateral stretches (need L/R)**: Hip flexor, pigeon pose, 90-90 stretch, side lunges, single leg forward fold
  - **Bilateral stretches (both sides)**: Butterfly, forward fold, child's pose, frog stretch
- **Upper body**: Lat stretch, shoulder stretch, tricep stretch, chest stretch, neck rolls
  - **Unilateral (need L/R)**: Side neck stretch, single arm tricep stretch, lat side bend
  - **Bilateral**: Chest opener, shoulder rolls, overhead reach
- **Full body**: Cat-cow, child's pose, downward dog, cobra pose, spinal twist
  - Most full-body stretches are bilateral or naturally alternate sides

### Yoga/Mindfulness
- Sun salutations, warrior poses, tree pose, triangle pose, seated meditation, breathing exercises

**IMPORTANT**: If the user asks for "strength workout", do NOT use stretches. If they ask for "stretch routine", do NOT use burpees or squats. Match exercises to the workout type!

## CRITICAL: Duration Calculation Requirements

**YOU MUST ENSURE THE TOTAL WORKOUT DURATION MATCHES THE USER'S REQUEST.**

### Step-by-step calculation process:

1. **Identify target duration**: If user says "1 hour workout", target is 3600 seconds. If "20 minutes", target is 1200 seconds.

2. **Calculate total time**:
   - For each IntervalStep: duration
   - For each LoopGroup: (sum of all item durations) × loops
   - Nested loops multiply: outer_loops × inner_loops × item_duration
   - Add warm-up and cooldown time

3. **Verify your math**: The sum of ALL intervals must equal the requested duration (±5% tolerance is acceptable)

### Example Calculation:
User asks: "30 minute workout with 5 exercises"
- Warm-up: 300 seconds (5 minutes)
- 5 exercises × 3 loops × (40 work + 20 rest) = 5 × 3 × 60 = 900 seconds (15 minutes)
- Cooldown: 300 seconds (5 minutes)
- **Total: 1500 seconds ≠ 1800 seconds** ❌ THIS IS WRONG!

Corrected:
- Warm-up: 300 seconds (5 minutes)
- 5 exercises × 4 loops × (45 work + 30 rest) = 5 × 4 × 75 = 1500 seconds (25 minutes)
- **Total: 1800 seconds = 30 minutes** ✅ CORRECT!

**COMMON MISTAKE**: Creating only 30 minutes of exercises when user asked for 60 minutes. Always verify your total duration!

## Instructions

1. **Analyze the user's request carefully** - Understand the language, intent, duration, exercise count, and intensity level

2. **Select appropriate exercises** - Based on workout type (strength/cardio/stretch/yoga), choose ONLY exercises from the matching category above. Use realistic exercise names that match the activity.

3. **Calculate target duration FIRST** - Before generating, determine total seconds needed. Plan how to distribute time across exercises to match this target.

4. **Generate multiple exercises when requested** - If the user asks for "6 exercises" or "multiple stretches", create multiple loop groups, each representing a different exercise

5. **Use loops appropriately** - For stretches and repeated exercises, create LoopGroups with work/rest pairs. Each exercise should typically be its own LoopGroup with appropriate loop count (3-6 loops for stretches, adjust based on duration)

6. **Structure workouts properly**:
   - Start with a warm-up interval if appropriate (type: "prepare" or "work", 5-10 minutes for long workouts)
   - Create separate LoopGroups for each different exercise
   - Each LoopGroup should contain: work interval + rest interval
   - Use skipOnLastLoop: true for final rest periods when appropriate
   - Use skipOnLastLoop: false for rest periods between repetitions
   - Add cooldown at the end for workouts over 30 minutes

7. **Verify total duration** - After structuring, mentally calculate total time. If it doesn't match the user's request, adjust loop counts or durations to reach the target.

8. **Exercise naming** - Use specific, realistic names that match the workout type:
   - ✅ Good: "Push-ups", "Squats", "Hip flexor stretch - SWITCH SIDES", "Jumping jacks"
   - ✅ For unilateral stretches: "Pigeon pose - L/R alternate", "Hip flexor - SWITCH SIDES", "Single leg stretch - Switch"
   - ❌ Bad: "Exercise 1", "Movement", "Activity"
   - **Critical**: For stretches that work one side at a time, always indicate side switching in the name and use 6 loops (3 per side)

9. **Use default colors** - Always include the default ColorSettings object. Do NOT add color fields to individual IntervalStep items unless you need to override the default.

10. **Ensure all IDs are unique strings** - Use sequential numbers: "1", "2", "3", etc.

11. **Use "prepare" type** for warm-up/preparation phases

12. **Use "work" type** for exercise/activity phases (including stretches)

13. **Use "rest" type** for rest/recovery phases between exercises

14. **Return ONLY the valid JSON object** - No markdown code blocks, no explanations, no additional text

## Key Patterns

### For Stretch Routines:
- **Multiple exercises**: Create multiple LoopGroups at the root level, each with a descriptive name
- **Work/Rest pairs**: Each LoopGroup typically contains [work, rest] sequence
- **Loop counts**: For stretches, use 3-6 loops per exercise depending on total duration
  - **IMPORTANT**: For unilateral stretches (one side at a time), use 6 loops total (3 per side) and indicate side switching in the exercise name
  - Example: "Hip flexor stretch - SWITCH SIDES" or "Pigeon pose - L/R alternate"
  - The 6 loops ensure equal work for both left and right sides
- **Rest durations**: 10-30 seconds for stretches, adjust based on intensity
- **Work durations**: 20-60 seconds for stretches, adjust based on exercise type
- **Bilateral vs Unilateral**:
  - Bilateral (both sides): "Butterfly stretch", "Forward fold" - use 3-4 loops
  - Unilateral (single side): "Hip flexor - SWITCH SIDES", "Pigeon L/R" - use 6 loops

### For Strength/HIIT Workouts:
- **Compound movements first**: Start with exercises like squats, push-ups, pull-ups
- **Work/Rest ratio**: Typically 30-60 seconds work, 15-30 seconds rest
- **Loop counts**: 3-5 sets per exercise for strength, 4-8 for HIIT
- **Exercise progression**: Upper body → Lower body → Core, or alternate muscle groups

### Duration Matching Strategy:
1. **Subtract warm-up/cool-down**: Reserve 10-20% of total time for warm-up and cool-down
2. **Distribute remaining time**: Divide equally among exercises
3. **Calculate per exercise**: If 6 exercises share 40 minutes = ~6.67 minutes each
4. **Convert to loops**: 6.67 min = 400 sec; if work=45s + rest=30s = 75s per loop, then 400÷75 ≈ 5 loops
5. **Verify total**: Always recalculate and adjust if needed to match the exact requested duration

**REMINDER**: If user asks for 60 minutes, generate 60 minutes of content. Not 30, not 45, but 60!

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
2. **Choose appropriate exercises**: Match exercises to the workout type (strength/cardio/stretch/yoga) - use realistic exercise names
3. **Calculate total duration**: Ensure the workout duration matches the user's request. If they asked for "1 hour", generate 60 minutes of content, NOT 30 minutes!
4. Ensure all required fields are present
5. Ensure all data types are correct (numbers as numbers, not strings)
6. Ensure all IDs are unique strings
7. Ensure colors are valid hex format
8. Ensure durations are between ${MIN_DURATION_SECONDS} and ${MAX_DURATION_SECONDS} seconds
9. Ensure loop counts are between 1 and ${MAX_LOOPS_PER_GROUP}
10. If the user requested multiple exercises (e.g., "6 exercises"), create multiple LoopGroups
11. For stretches, structure each exercise as a LoopGroup with work/rest pairs
12. **Verify math**: Sum all intervals (accounting for loops) to confirm total duration matches request
13. Return ONLY valid JSON, no markdown code blocks, no explanations, no additional text

Generate the corrected workout configuration now:`;
}

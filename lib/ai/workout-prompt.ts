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
## JSON Schema for Workout Structure

The output MUST be a valid JSON object matching this exact structure:

\`\`\`typescript
interface WorkoutOutput {
  name?: string;           // Optional: Workout name (e.g., "Tabata Classic", "HIIT Beginner", "Morning Stretch")
  items: WorkoutItem[];
}

type WorkoutItem = IntervalStep | LoopGroup;

interface IntervalStep {
  id: string;              // Unique identifier (e.g., "1", "2", "3")
  name: string;            // Display name (e.g., "WARM UP", "SQUATS")
  duration: number;        // Duration in seconds (${MIN_DURATION_SECONDS}-${MAX_DURATION_SECONDS})
  type: "prepare" | "work" | "rest";  // Interval type
  skipOnLastLoop?: boolean; // Optional: skip this on last loop iteration
}

interface LoopGroup {
  id: string;              // Unique identifier
  loops: number;           // Number of repetitions (1-${MAX_LOOPS_PER_GROUP})
  items: WorkoutItem[];    // Nested intervals or loops
  collapsed?: boolean;     // Optional: UI state
}
\`\`\`

## Validation Rules

1. **Required fields**: items
2. **Optional fields**: name (recommended for new workouts, preserve when editing)
3. **items**: Must be a non-empty array of WorkoutItem objects
4. **IntervalStep.duration**: Must be a number between ${MIN_DURATION_SECONDS} and ${MAX_DURATION_SECONDS}
5. **IntervalStep.type**: Must be exactly "prepare", "work", or "rest"
6. **LoopGroup.loops**: Must be a number between 1 and ${MAX_LOOPS_PER_GROUP}
7. **LoopGroup.items**: Must be a non-empty array
8. **All IDs**: Must be unique strings

**IMPORTANT**: Do NOT include colors, sounds, or any UI preferences in your output. Only generate the workout structure (items array and optional name).
`;

const EXAMPLES = `
## High-Quality Workout Examples

### Example 1: Tabata Classic (8 rounds, 20s work / 10s rest)
\`\`\`json
{
  "name": "Tabata Classic",
  "items": [
    {
      "id": "loop-1",
      "loops": 8,
      "items": [
        {
          "id": "work-1",
          "name": "Work",
          "duration": 20,
          "type": "work"
        },
        {
          "id": "rest-1",
          "name": "Rest",
          "duration": 10,
          "type": "rest"
        }
      ]
    }
  ]
}
\`\`\`

### Example 2: HIIT Beginner (30s work / 30s rest, 10 rounds with warm-up)
\`\`\`json
{
  "name": "HIIT Beginner",
  "items": [
    {
      "id": "prepare-1",
      "name": "Get Ready",
      "duration": 10,
      "type": "prepare"
    },
    {
      "id": "loop-1",
      "loops": 10,
      "items": [
        {
          "id": "work-1",
          "name": "Work",
          "duration": 30,
          "type": "work"
        },
        {
          "id": "rest-1",
          "name": "Rest",
          "duration": 30,
          "type": "rest"
        }
      ]
    }
  ]
}
\`\`\`

### Example 3: Boxing Rounds (3min work / 1min rest, 12 rounds)
\`\`\`json
{
  "name": "Boxing Rounds",
  "items": [
    {
      "id": "prepare-1",
      "name": "Warm Up",
      "duration": 180,
      "type": "prepare"
    },
    {
      "id": "loop-1",
      "loops": 12,
      "items": [
        {
          "id": "work-1",
          "name": "Round",
          "duration": 180,
          "type": "work"
        },
        {
          "id": "rest-1",
          "name": "Rest",
          "duration": 60,
          "type": "rest",
          "skipOnLastLoop": true
        }
      ]
    }
  ]
}
\`\`\`

### Example 4: Strength Circuit (45s work / 15s rest, 8 exercises)
\`\`\`json
{
  "name": "Strength Circuit",
  "items": [
    {
      "id": "prepare-1",
      "name": "Warm Up",
      "duration": 90,
      "type": "prepare"
    },
    {
      "id": "loop-1",
      "loops": 8,
      "items": [
        {
          "id": "work-1",
          "name": "Exercise",
          "duration": 45,
          "type": "work"
        },
        {
          "id": "rest-1",
          "name": "Rest",
          "duration": 15,
          "type": "rest",
          "skipOnLastLoop": true
        }
      ]
    }
  ]
}
\`\`\`

### Example 5: Yoga Flow (5 poses × 1min, 30s transitions)
\`\`\`json
{
  "name": "Yoga Flow",
  "items": [
    {
      "id": "loop-1",
      "loops": 5,
      "items": [
        {
          "id": "work-1",
          "name": "Hold Pose",
          "duration": 60,
          "type": "work"
        },
        {
          "id": "rest-1",
          "name": "Transition",
          "duration": 30,
          "type": "rest",
          "skipOnLastLoop": true
        }
      ]
    }
  ]
}
\`\`\`

### Example 6: HIIT Advanced (60s work / 20s rest, 12 rounds)
\`\`\`json
{
  "name": "HIIT Advanced",
  "items": [
    {
      "id": "prepare-1",
      "name": "Warm Up",
      "duration": 120,
      "type": "prepare"
    },
    {
      "id": "loop-1",
      "loops": 12,
      "items": [
        {
          "id": "work-1",
          "name": "Work",
          "duration": 60,
          "type": "work"
        },
        {
          "id": "rest-1",
          "name": "Rest",
          "duration": 20,
          "type": "rest"
        }
      ]
    }
  ]
}
\`\`\`

### Example 7: Pomodoro Classic (25min work / 5min rest, 4 rounds + long break)
\`\`\`json
{
  "name": "Pomodoro Classic",
  "items": [
    {
      "id": "loop-1",
      "loops": 4,
      "items": [
        {
          "id": "work-1",
          "name": "Focus",
          "duration": 1500,
          "type": "work"
        },
        {
          "id": "rest-1",
          "name": "Break",
          "duration": 300,
          "type": "rest",
          "skipOnLastLoop": true
        }
      ]
    },
    {
      "id": "rest-2",
      "name": "Long Break",
      "duration": 900,
      "type": "rest"
    }
  ]
}
\`\`\`
`;

/**
 * Builds the initial prompt for first generation attempt
 */
export function buildInitialPrompt(
	userPrompt: string,
	currentConfig?: AdvancedConfig,
	currentName?: string,
): string {
	const currentStateSection = currentConfig
		? `
## Current Workout State

The user is currently editing an existing workout. You can either:
- **Modify the existing workout** based on their request (preserve structure, adjust durations, change exercises, etc.)
- **Generate a completely new workout** if the user explicitly asks for a new one or wants a major overhaul

**Original Workout Name**: "${currentName || "Untitled Workout"}"

**Current Workout Structure**:
\`\`\`json
${JSON.stringify({ items: currentConfig.items }, null, 2)}
\`\`\`

**IMPORTANT**: 
- If the user asks for tweaks, modifications, or adjustments, preserve the overall structure and make targeted changes
- If the user asks for a new workout or complete rewrite, generate a fresh workout structure
- When editing, you can update the workout name if the user's request suggests a new name, or preserve the original name if it still fits
- Always return BOTH the name field (updated or preserved) AND the items array
`
		: "";

	return `You are a workout timer generator AI. Your task is to generate a valid JSON configuration for a workout timer based on the user's natural language request.

**You can do TWO things:**
1. **Generate a new workout** from scratch when the user describes what they want
2. **Edit an existing workout** when the user provides modifications, tweaks, or adjustments to their current workout

${currentStateSection ? currentStateSection : "**This is a NEW workout generation** - the user is creating a workout from scratch."}

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

9. **Ensure all IDs are unique strings** - Use sequential numbers: "1", "2", "3", etc.

10. **Use "prepare" type** for warm-up/preparation phases

11. **Use "work" type** for exercise/activity phases (including stretches)

12. **Use "rest" type** for rest/recovery phases between exercises

13. **Return the valid JSON object** - No markdown code blocks, no explanations, no additional text. The output must be:
    - For NEW workouts: { "name": "Descriptive Workout Name", "items": [...] }
    - For EDITED workouts: { "name": "Updated or Original Name", "items": [...] }
    - The name field should be descriptive and match the workout type (e.g., "Tabata Classic", "HIIT Beginner", "Morning Stretch", "Boxing Rounds")

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
	currentConfig?: AdvancedConfig,
	currentName?: string,
): string {
	const currentStateSection = currentConfig
		? `
## Current Workout State (Being Edited)

**Original Workout Name**: "${currentName || "Untitled Workout"}"

**Current Workout Structure**:
\`\`\`json
${JSON.stringify({ items: currentConfig.items }, null, 2)}
\`\`\`

Remember: You can modify the existing workout or generate a new one based on the user's request. Always return both name and items.
`
		: "";

	return `RETRY ATTEMPT ${attempt}/3

Your previous response failed validation. Please fix the following issues:

## Language Support

You MUST understand and process requests in MULTIPLE languages, including:
- English
- Hungarian (Magyar)
- Other languages as needed

## Original User Request

"${userPrompt}"

${currentStateSection}

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
7. Ensure durations are between ${MIN_DURATION_SECONDS} and ${MAX_DURATION_SECONDS} seconds
8. Ensure loop counts are between 1 and ${MAX_LOOPS_PER_GROUP}
9. If the user requested multiple exercises (e.g., "6 exercises"), create multiple LoopGroups
10. For stretches, structure each exercise as a LoopGroup with work/rest pairs
11. **Verify math**: Sum all intervals (accounting for loops) to confirm total duration matches request
12. **Return valid JSON with name and items**: { "name": "Workout Name", "items": [...] }
13. The name field is required - use a descriptive name that matches the workout type
14. No markdown code blocks, no explanations, no additional text - ONLY the JSON object

Generate the corrected workout configuration now:`;
}

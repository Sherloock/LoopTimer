import {
	MAX_DURATION_SECONDS,
	MAX_LOOPS_PER_GROUP,
	MAX_WORKOUT_ITEMS,
	MIN_DURATION_SECONDS,
} from "@/lib/constants/ai";
import { TIMER_TYPES } from "@/types/advanced-timer";

export interface ValidationError {
	path: string;
	message: string;
	expected?: string;
	received?: string;
}

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	details: ValidationError[];
}

/**
 * Validates if a value is a valid hex color
 */
function isValidHexColor(color: string): boolean {
	return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validates an IntervalStep object
 */
function validateIntervalStep(
	item: unknown,
	path: string,
	errors: ValidationError[],
): boolean {
	if (typeof item !== "object" || item === null) {
		errors.push({
			path,
			message: "Must be an object",
			expected: "IntervalStep object",
			received: typeof item,
		});
		return false;
	}

	const interval = item as Record<string, unknown>;
	let isValid = true;

	// Validate required fields
	if (typeof interval.id !== "string" || !interval.id) {
		errors.push({
			path: `${path}.id`,
			message: "Missing or invalid id",
			expected: "non-empty string",
			received: typeof interval.id,
		});
		isValid = false;
	}

	if (typeof interval.name !== "string" || !interval.name) {
		errors.push({
			path: `${path}.name`,
			message: "Missing or invalid name",
			expected: "non-empty string",
			received: typeof interval.name,
		});
		isValid = false;
	}

	if (typeof interval.duration !== "number") {
		errors.push({
			path: `${path}.duration`,
			message: `Expected number between ${MIN_DURATION_SECONDS}-${MAX_DURATION_SECONDS}, got ${typeof interval.duration}`,
			expected: `number (${MIN_DURATION_SECONDS}-${MAX_DURATION_SECONDS})`,
			received: typeof interval.duration,
		});
		isValid = false;
	} else if (
		interval.duration < MIN_DURATION_SECONDS ||
		interval.duration > MAX_DURATION_SECONDS
	) {
		errors.push({
			path: `${path}.duration`,
			message: `Duration must be between ${MIN_DURATION_SECONDS} and ${MAX_DURATION_SECONDS} seconds`,
			expected: `number (${MIN_DURATION_SECONDS}-${MAX_DURATION_SECONDS})`,
			received: String(interval.duration),
		});
		isValid = false;
	}

	if (!TIMER_TYPES.includes(interval.type as (typeof TIMER_TYPES)[number])) {
		errors.push({
			path: `${path}.type`,
			message: `Invalid value '${interval.type}', must be '${TIMER_TYPES.join("' | '")}'`,
			expected: `'${TIMER_TYPES.join("' | '")}'`,
			received: String(interval.type),
		});
		isValid = false;
	}

	// Optional fields validation
	if (
		interval.color !== undefined &&
		(typeof interval.color !== "string" || !isValidHexColor(interval.color))
	) {
		errors.push({
			path: `${path}.color`,
			message: "Invalid hex color format",
			expected: "hex color (e.g., #FF0000)",
			received: String(interval.color),
		});
		isValid = false;
	}

	if (
		interval.skipOnLastLoop !== undefined &&
		typeof interval.skipOnLastLoop !== "boolean"
	) {
		errors.push({
			path: `${path}.skipOnLastLoop`,
			message: "Must be a boolean",
			expected: "boolean",
			received: typeof interval.skipOnLastLoop,
		});
		isValid = false;
	}

	if (
		interval.sound !== undefined &&
		typeof interval.sound !== "string" &&
		interval.sound !== null
	) {
		errors.push({
			path: `${path}.sound`,
			message: "Must be a string or undefined",
			expected: "string | undefined",
			received: typeof interval.sound,
		});
		isValid = false;
	}

	return isValid;
}

/**
 * Validates a LoopGroup object
 */
function validateLoopGroup(
	item: unknown,
	path: string,
	errors: ValidationError[],
	depth: number = 0,
): boolean {
	if (typeof item !== "object" || item === null) {
		errors.push({
			path,
			message: "Must be an object",
			expected: "LoopGroup object",
			received: typeof item,
		});
		return false;
	}

	const loop = item as Record<string, unknown>;
	let isValid = true;

	// Validate required fields
	if (typeof loop.id !== "string" || !loop.id) {
		errors.push({
			path: `${path}.id`,
			message: "Missing or invalid id",
			expected: "non-empty string",
			received: typeof loop.id,
		});
		isValid = false;
	}

	if (typeof loop.loops !== "number") {
		errors.push({
			path: `${path}.loops`,
			message: `Expected number between 1-${MAX_LOOPS_PER_GROUP}, got ${typeof loop.loops}`,
			expected: `number (1-${MAX_LOOPS_PER_GROUP})`,
			received: typeof loop.loops,
		});
		isValid = false;
	} else if (loop.loops < 1 || loop.loops > MAX_LOOPS_PER_GROUP) {
		errors.push({
			path: `${path}.loops`,
			message: `Loop count must be between 1 and ${MAX_LOOPS_PER_GROUP}`,
			expected: `number (1-${MAX_LOOPS_PER_GROUP})`,
			received: String(loop.loops),
		});
		isValid = false;
	}

	if (!Array.isArray(loop.items)) {
		errors.push({
			path: `${path}.items`,
			message: "Must be an array",
			expected: "WorkoutItem[]",
			received: typeof loop.items,
		});
		isValid = false;
	} else if (loop.items.length === 0) {
		errors.push({
			path: `${path}.items`,
			message: "Loop must contain at least 1 item, got empty array",
			expected: "non-empty array",
			received: "empty array",
		});
		isValid = false;
	} else {
		// Validate nested items
		for (let i = 0; i < loop.items.length; i++) {
			const nestedItem = loop.items[i];
			const nestedPath = `${path}.items[${i}]`;
			if (!validateWorkoutItem(nestedItem, nestedPath, errors, depth + 1)) {
				isValid = false;
			}
		}
	}

	// Optional fields validation
	if (loop.collapsed !== undefined && typeof loop.collapsed !== "boolean") {
		errors.push({
			path: `${path}.collapsed`,
			message: "Must be a boolean",
			expected: "boolean",
			received: typeof loop.collapsed,
		});
		isValid = false;
	}

	if (
		loop.color !== undefined &&
		(typeof loop.color !== "string" || !isValidHexColor(loop.color))
	) {
		errors.push({
			path: `${path}.color`,
			message: "Invalid hex color format",
			expected: "hex color (e.g., #FF0000)",
			received: String(loop.color),
		});
		isValid = false;
	}

	return isValid;
}

/**
 * Validates a WorkoutItem (can be IntervalStep or LoopGroup)
 */
function validateWorkoutItem(
	item: unknown,
	path: string,
	errors: ValidationError[],
	depth: number = 0,
): boolean {
	if (typeof item !== "object" || item === null) {
		errors.push({
			path,
			message: "Must be an object",
			expected: "IntervalStep | LoopGroup",
			received: typeof item,
		});
		return false;
	}

	const obj = item as Record<string, unknown>;

	// Determine if it's a LoopGroup or IntervalStep
	const hasLoops = "loops" in obj && "items" in obj;
	const hasDuration = "duration" in obj && "type" in obj;

	if (hasLoops) {
		return validateLoopGroup(item, path, errors, depth);
	} else if (hasDuration) {
		return validateIntervalStep(item, path, errors);
	} else {
		errors.push({
			path,
			message:
				"Invalid WorkoutItem: must have either (loops + items) or (duration + type)",
			expected: "IntervalStep | LoopGroup",
			received: "unknown structure",
		});
		return false;
	}
}

/**
 * Main validation function for AdvancedConfig
 */
export function validateAdvancedConfig(data: unknown): ValidationResult {
	const errors: ValidationError[] = [];

	// Check if data is an object
	if (typeof data !== "object" || data === null) {
		return {
			valid: false,
			errors: ["Root must be an object"],
			details: [
				{
					path: "root",
					message: "Must be an object",
					expected: "AdvancedConfig object",
					received: typeof data,
				},
			],
		};
	}

	const config = data as Record<string, unknown>;

	// Validate items array
	if (!Array.isArray(config.items)) {
		errors.push({
			path: "items",
			message: "Missing or invalid items array",
			expected: "WorkoutItem[]",
			received: typeof config.items,
		});
	} else {
		if (config.items.length === 0) {
			errors.push({
				path: "items",
				message: "Items array cannot be empty",
				expected: "non-empty array",
				received: "empty array",
			});
		} else if (config.items.length > MAX_WORKOUT_ITEMS) {
			errors.push({
				path: "items",
				message: `Too many items (max ${MAX_WORKOUT_ITEMS})`,
				expected: `array with <= ${MAX_WORKOUT_ITEMS} items`,
				received: `array with ${config.items.length} items`,
			});
		} else {
			// Validate each item
			for (let i = 0; i < config.items.length; i++) {
				validateWorkoutItem(config.items[i], `items[${i}]`, errors);
			}
		}
	}

	// Format error messages for display
	const errorMessages = errors.map((err) => {
		if (err.received) {
			return `${err.path}: ${err.message}`;
		}
		return `${err.path}: ${err.message}`;
	});

	return {
		valid: errors.length === 0,
		errors: errorMessages,
		details: errors,
	};
}

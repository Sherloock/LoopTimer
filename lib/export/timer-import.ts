import { z } from "zod";
import type { AdvancedConfig } from "@/types/advanced-timer";
import type { TimerExport } from "./timer-export";

// Import the AdvancedConfig schema from timerSchema if it exists
// Otherwise, define a basic version here
const IntervalStepSchema = z.object({
	id: z.string(),
	name: z.string(),
	duration: z.number().positive(),
	type: z.enum(["prepare", "work", "rest"]),
	color: z.string().optional(),
	skipOnLastLoop: z.boolean().optional(),
	sound: z.string().optional(),
});

const LoopGroupSchema: z.ZodType<any> = z.lazy(() =>
	z.object({
		id: z.string(),
		loops: z.number().int().positive(),
		items: z.array(z.union([IntervalStepSchema, LoopGroupSchema])),
		collapsed: z.boolean().optional(),
		color: z.string().optional(),
	}),
);

const WorkoutItemSchema = z.union([IntervalStepSchema, LoopGroupSchema]);

const ColorSettingsSchema = z.object({
	prepare: z.string(),
	work: z.string(),
	rest: z.string(),
	loop: z.string(),
	nestedLoop: z.string(),
});

const AdvancedConfigSchema = z.object({
	items: z.array(WorkoutItemSchema),
	colors: ColorSettingsSchema,
	defaultAlarm: z.string(),
	speakNames: z.boolean(),
});

export const TimerExportSchema = z.object({
	version: z.string(),
	exportedAt: z.string().datetime(),
	timer: z.object({
		name: z.string().min(1).max(100),
		data: AdvancedConfigSchema,
	}),
});

export interface ValidationResult {
	success: boolean;
	data?: TimerExport;
	error?: string;
}

export function validateTimerImport(data: unknown): ValidationResult {
	try {
		const parsed = TimerExportSchema.parse(data);
		return { success: true, data: parsed };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const firstError = error.errors[0];
			const path = firstError.path.join(".");
			return {
				success: false,
				error: `Invalid timer format: ${firstError.message} at ${path}`,
			};
		}
		return {
			success: false,
			error: "Invalid timer format: Unknown error",
		};
	}
}

export function parseTimerFromJSON(jsonString: string): ValidationResult {
	try {
		const data = JSON.parse(jsonString);
		return validateTimerImport(data);
	} catch (error) {
		return {
			success: false,
			error: "Invalid JSON format",
		};
	}
}

export async function parseTimerFromFile(
	file: File,
): Promise<ValidationResult> {
	try {
		const text = await file.text();
		return parseTimerFromJSON(text);
	} catch (error) {
		return {
			success: false,
			error: "Failed to read file",
		};
	}
}

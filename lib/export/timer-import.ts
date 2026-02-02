import { timerExportSchema } from "@/schema/timerSchema";
import { z } from "zod";
import type { TimerExport } from "./timer-export";

export interface ValidationResult {
	success: boolean;
	data?: TimerExport;
	error?: string;
}

export function validateTimerImport(data: unknown): ValidationResult {
	try {
		const parsed = timerExportSchema.parse(data);
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

import { z } from "zod";

import {
	TEMPLATE_CATEGORIES,
	TIMER_NAME_MAX_LENGTH,
} from "@/lib/constants/timers";
import type { LoopGroup } from "@/types/advanced-timer";
import { TIMER_TYPES } from "@/types/advanced-timer";

export const colorSettingsSchema = z.object({
	prepare: z.string(),
	work: z.string(),
	rest: z.string(),
	loop: z.string(),
	nestedLoop: z.string(),
});

const intervalStepSchema = z.object({
	id: z.string(),
	name: z.string(),
	duration: z.number().positive(),
	type: z.enum(TIMER_TYPES),
	color: z.string().optional(),
	skipOnLastLoop: z.boolean().optional(),
	sound: z.string().optional(),
});

const loopGroupSchema: z.ZodType<LoopGroup> = z.lazy(() =>
	z.object({
		id: z.string(),
		loops: z.number().int().positive(),
		items: z.array(z.union([intervalStepSchema, loopGroupSchema])),
		collapsed: z.boolean().optional(),
		color: z.string().optional(),
	}),
);

const workoutItemSchema = z.union([intervalStepSchema, loopGroupSchema]);

export const advancedConfigSchema = z.object({
	items: z.array(workoutItemSchema),
	colors: colorSettingsSchema,
	defaultAlarm: z.string(),
	speakNames: z.boolean(),
});

export const timerExportSchema = z.object({
	version: z.string(),
	exportedAt: z.string().datetime(),
	timer: z.object({
		name: z.string().min(1).max(TIMER_NAME_MAX_LENGTH),
		data: advancedConfigSchema,
	}),
});

export const timerSchema = z.object({
	name: z.string().min(1).max(TIMER_NAME_MAX_LENGTH),
	data: z.any(),
	category: z
		.enum([
			TEMPLATE_CATEGORIES.HIIT,
			TEMPLATE_CATEGORIES.TABATA,
			TEMPLATE_CATEGORIES.BOXING,
			TEMPLATE_CATEGORIES.YOGA,
			TEMPLATE_CATEGORIES.STRENGTH,
			TEMPLATE_CATEGORIES.POMODORO,
			TEMPLATE_CATEGORIES.CUSTOM,
		])
		.optional()
		.nullable(),
	icon: z.string().optional().nullable(),
	color: z.string().optional().nullable(),
	colors: colorSettingsSchema.optional().nullable(),
	isSpeakNames: z.boolean().optional().nullable(),
	defaultAlarm: z.string().optional().nullable(),
	description: z.string().max(500).optional().nullable(),
});

export type TimerInput = z.infer<typeof timerSchema>;

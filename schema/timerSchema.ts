import { z } from "zod";

import {
	TIMER_NAME_MAX_LENGTH,
	TEMPLATE_CATEGORIES,
} from "@/lib/constants/timers";
import type { ColorSettings } from "@/types/advanced-timer";

const colorSettingsSchema = z.object({
	prepare: z.string(),
	work: z.string(),
	rest: z.string(),
	loop: z.string(),
	nestedLoop: z.string(),
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

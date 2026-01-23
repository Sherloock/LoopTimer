"use server";

import { checkAuth } from "@/actions/auth/authCheck";
import { db } from "@/prisma";
import { timerSchema } from "@/schema/timerSchema";
import { revalidatePath } from "next/cache";
import { DEFAULT_USER_PREFERENCES } from "@/lib/constants/timers";

export async function createTimer(formData: unknown) {
	const userId = await checkAuth();

	const parsed = timerSchema.parse(formData);

	// Get user preferences for defaults
	const userPreferences = await db.userPreferences.findUnique({
		where: { userId },
	});

	const timer = await db.timer.create({
		data: {
			userId,
			name: parsed.name || "New Timer",
			data: parsed.data,
			category: parsed.category ?? "custom",
			icon: parsed.icon ?? null,
			color: parsed.color ?? null,
			colors:
				parsed.colors ??
				userPreferences?.colors ??
				DEFAULT_USER_PREFERENCES.colors,
			isSpeakNames:
				parsed.isSpeakNames ??
				userPreferences?.isSpeakNames ??
				DEFAULT_USER_PREFERENCES.isSpeakNames,
			defaultAlarm:
				parsed.defaultAlarm ??
				userPreferences?.defaultAlarm ??
				DEFAULT_USER_PREFERENCES.defaultAlarm,
			description: parsed.description ?? null,
		},
	});

	// Revalidate root or relevant page
	revalidatePath("/");

	return timer;
}

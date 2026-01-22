"use server";

import { checkAuth } from "@/actions/auth/authCheck";
import { DEFAULT_USER_PREFERENCES } from "@/lib/constants/timers";
import { db } from "@/prisma";
import type { ColorSettings } from "@/types/advanced-timer";

export interface UserPreferencesData {
	colors: ColorSettings;
	defaultAlarm: string;
	isSound: boolean;
	isSpeakNames: boolean;
}

/**
 * Returns system default preferences
 */
export async function getDefaultPreferences(): Promise<UserPreferencesData> {
	return {
		colors: DEFAULT_USER_PREFERENCES.colors,
		defaultAlarm: DEFAULT_USER_PREFERENCES.defaultAlarm,
		isSound: DEFAULT_USER_PREFERENCES.isSound,
		isSpeakNames: DEFAULT_USER_PREFERENCES.isSpeakNames,
	};
}

/**
 * Fetches user preferences or creates default preferences if none exist
 */
export async function getUserPreferences(): Promise<UserPreferencesData> {
	const userId = await checkAuth();

	const existing = await db.userPreferences.findUnique({
		where: { userId },
	});

	if (existing) {
		return {
			colors: existing.colors as unknown as ColorSettings,
			defaultAlarm: existing.defaultAlarm,
			isSound: existing.isSound,
			isSpeakNames: existing.isSpeakNames,
		};
	}

	// Create default preferences
	const defaults = await getDefaultPreferences();
	const created = await db.userPreferences.create({
		data: {
			userId,
			colors: defaults.colors as any,
			defaultAlarm: defaults.defaultAlarm,
			isSound: defaults.isSound,
			isSpeakNames: defaults.isSpeakNames,
		},
	});

	return {
		colors: created.colors as unknown as ColorSettings,
		defaultAlarm: created.defaultAlarm,
		isSound: created.isSound,
		isSpeakNames: created.isSpeakNames,
	};
}

/**
 * Updates user preferences
 */
export async function updateUserPreferences(
	preferences: Partial<UserPreferencesData>,
): Promise<UserPreferencesData> {
	const userId = await checkAuth();

	// Validate colors structure if provided
	if (preferences.colors) {
		const requiredKeys: (keyof ColorSettings)[] = [
			"prepare",
			"work",
			"rest",
			"loop",
			"nestedLoop",
		];
		for (const key of requiredKeys) {
			if (!preferences.colors[key]) {
				throw new Error(`Missing color for ${key}`);
			}
		}
	}

	// Validate defaultAlarm if provided
	if (preferences.defaultAlarm) {
		const validAlarms = [
			"none",
			"beep-short",
			"beep-1x",
			"beep-2x",
			"beep-3x",
			"bell-short",
			"bell-1x",
			"bell-2x",
			"bell-3x",
			"gong-short",
			"gong-1x",
			"gong-2x",
			"gong-3x",
			"whistle-short",
			"whistle-1x",
			"whistle-2x",
			"whistle-3x",
		];
		if (!validAlarms.includes(preferences.defaultAlarm)) {
			throw new Error(`Invalid defaultAlarm: ${preferences.defaultAlarm}`);
		}
	}

	const defaults = await getDefaultPreferences();
	const updated = await db.userPreferences.upsert({
		where: { userId },
		create: {
			userId,
			colors: (preferences.colors || defaults.colors) as any,
			defaultAlarm: preferences.defaultAlarm || defaults.defaultAlarm,
			isSound:
				preferences.isSound !== undefined
					? preferences.isSound
					: defaults.isSound,
			isSpeakNames:
				preferences.isSpeakNames !== undefined
					? preferences.isSpeakNames
					: defaults.isSpeakNames,
		},
		update: {
			...(preferences.colors && { colors: preferences.colors as any }),
			...(preferences.defaultAlarm && {
				defaultAlarm: preferences.defaultAlarm,
			}),
			...(preferences.isSound !== undefined && {
				isSound: preferences.isSound,
			}),
			...(preferences.isSpeakNames !== undefined && {
				isSpeakNames: preferences.isSpeakNames,
			}),
		},
	});

	return {
		colors: updated.colors as unknown as ColorSettings,
		defaultAlarm: updated.defaultAlarm,
		isSound: updated.isSound,
		isSpeakNames: updated.isSpeakNames,
	};
}

/**
 * Hook for managing timer metadata settings (category, icon, colors, etc.).
 * Syncs with loaded timer data and user preferences.
 */

import {
	ADVANCED_TIMER_DEFAULT_COLORS,
	TEMPLATE_CATEGORIES,
	TIMER_NAME_MAX_LENGTH,
} from "@/lib/constants/timers";
import type { ColorSettings, LoadedTimer } from "@/types/advanced-timer";
import { useCallback, useEffect, useState } from "react";

interface UserPreferencesData {
	colors?: ColorSettings;
	defaultAlarm?: string;
	isSpeakNames?: boolean;
}

interface UseTimerSettingsOptions {
	loadedTimer?: LoadedTimer;
	userPreferences?: UserPreferencesData;
	onTimerNameChange?: (name: string) => void;
}

export interface TimerSettingsState {
	timerName: string;
	timerCategory: string;
	timerIcon: string | null;
	timerColor: string | null;
	timerColors: ColorSettings;
	timerIsSpeakNames: boolean;
	timerDefaultAlarm: string;
	timerDescription: string;
	normalizedCategory: string;
}

export interface TimerSettingsActions {
	handleTimerNameChange: (name: string) => void;
	setTimerCategory: React.Dispatch<React.SetStateAction<string>>;
	setTimerIcon: React.Dispatch<React.SetStateAction<string | null>>;
	setTimerColor: React.Dispatch<React.SetStateAction<string | null>>;
	setTimerColors: React.Dispatch<React.SetStateAction<ColorSettings>>;
	setTimerIsSpeakNames: React.Dispatch<React.SetStateAction<boolean>>;
	setTimerDefaultAlarm: React.Dispatch<React.SetStateAction<string>>;
	setTimerDescription: React.Dispatch<React.SetStateAction<string>>;
	/** Apply all settings from the settings dialog at once */
	applySettingsFromDialog: (settings: {
		category: string;
		icon: string | null;
		color: string | null;
		colors: ColorSettings;
		isSpeakNames: boolean;
		defaultAlarm: string;
		description: string | null;
	}) => void;
}

export type TimerSettingsResult = TimerSettingsState & TimerSettingsActions;

export function useTimerSettings({
	loadedTimer,
	userPreferences,
	onTimerNameChange,
}: UseTimerSettingsOptions): TimerSettingsResult {
	// Timer name handling
	const [timerName, setTimerName] = useState<string>(loadedTimer?.name || "");

	// Timer settings state
	const [timerCategory, setTimerCategory] = useState<string>(
		loadedTimer?.category || TEMPLATE_CATEGORIES.CUSTOM,
	);
	const [timerIcon, setTimerIcon] = useState<string | null>(
		loadedTimer?.icon || null,
	);
	const [timerColor, setTimerColor] = useState<string | null>(
		loadedTimer?.color || null,
	);
	const [timerColors, setTimerColors] = useState<ColorSettings>(
		(loadedTimer?.colors as ColorSettings) ||
			userPreferences?.colors ||
			ADVANCED_TIMER_DEFAULT_COLORS,
	);
	const [timerIsSpeakNames, setTimerIsSpeakNames] = useState<boolean>(
		loadedTimer?.isSpeakNames ?? userPreferences?.isSpeakNames ?? true,
	);
	const [timerDefaultAlarm, setTimerDefaultAlarm] = useState<string>(
		loadedTimer?.defaultAlarm || userPreferences?.defaultAlarm || "beep-1x",
	);
	const [timerDescription, setTimerDescription] = useState<string>(
		loadedTimer?.description || "",
	);

	// Normalize category for old timers without category
	const normalizedCategory = timerCategory || TEMPLATE_CATEGORIES.CUSTOM;

	// Sync settings when loadedTimer or userPreferences change
	useEffect(() => {
		if (loadedTimer?.name) {
			setTimerName(loadedTimer.name.slice(0, TIMER_NAME_MAX_LENGTH));
		}
		if (loadedTimer?.category) {
			setTimerCategory(loadedTimer.category);
		}
		if (loadedTimer?.icon) {
			setTimerIcon(loadedTimer.icon);
		}
		if (loadedTimer?.color) {
			setTimerColor(loadedTimer.color);
		}
		if (loadedTimer?.colors) {
			setTimerColors(loadedTimer.colors as ColorSettings);
		} else if (userPreferences?.colors) {
			setTimerColors(userPreferences.colors);
		}
		if (
			loadedTimer?.isSpeakNames !== undefined &&
			loadedTimer.isSpeakNames !== null
		) {
			setTimerIsSpeakNames(loadedTimer.isSpeakNames);
		} else if (
			userPreferences?.isSpeakNames !== undefined &&
			userPreferences.isSpeakNames !== null
		) {
			setTimerIsSpeakNames(userPreferences.isSpeakNames);
		}
		if (loadedTimer?.defaultAlarm) {
			setTimerDefaultAlarm(loadedTimer.defaultAlarm);
		} else if (userPreferences?.defaultAlarm) {
			setTimerDefaultAlarm(userPreferences.defaultAlarm);
		}
		if (loadedTimer?.description) {
			setTimerDescription(loadedTimer.description);
		}
	}, [loadedTimer, userPreferences]);

	// Handle timer name change with max length and parent notification
	const handleTimerNameChange = useCallback(
		(name: string) => {
			const nextName = name.slice(0, TIMER_NAME_MAX_LENGTH);
			setTimerName(nextName);
			onTimerNameChange?.(nextName);
		},
		[onTimerNameChange],
	);

	// Apply all settings at once (from the settings dialog)
	const applySettingsFromDialog = useCallback(
		(settings: {
			category: string;
			icon: string | null;
			color: string | null;
			colors: ColorSettings;
			isSpeakNames: boolean;
			defaultAlarm: string;
			description: string | null;
		}) => {
			setTimerCategory(settings.category);
			setTimerIcon(settings.icon);
			setTimerColor(settings.color);
			setTimerColors(settings.colors);
			setTimerIsSpeakNames(settings.isSpeakNames);
			setTimerDefaultAlarm(settings.defaultAlarm);
			setTimerDescription(settings.description || "");
		},
		[],
	);

	return {
		// State
		timerName,
		timerCategory,
		timerIcon,
		timerColor,
		timerColors,
		timerIsSpeakNames,
		timerDefaultAlarm,
		timerDescription,
		normalizedCategory,
		// Actions
		handleTimerNameChange,
		setTimerCategory,
		setTimerIcon,
		setTimerColor,
		setTimerColors,
		setTimerIsSpeakNames,
		setTimerDefaultAlarm,
		setTimerDescription,
		applySettingsFromDialog,
	};
}

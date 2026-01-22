import type {
	AdvancedConfig,
	IntervalStep,
	LoopGroup,
	WorkoutItem,
} from "@/types/advanced-timer";

/**
 * Strips all color and sound data from workout config for AI generation.
 * Returns minimal structure with only workout items.
 */
export function stripColorsAndSounds(config: AdvancedConfig): {
	items: WorkoutItem[];
} {
	const stripItem = (item: WorkoutItem): WorkoutItem => {
		if ("loops" in item) {
			// LoopGroup
			const loopGroup: LoopGroup = {
				id: item.id,
				loops: item.loops,
				items: item.items.map(stripItem),
			};
			if (item.collapsed !== undefined) {
				loopGroup.collapsed = item.collapsed;
			}
			return loopGroup;
		} else {
			// IntervalStep
			const interval: IntervalStep = {
				id: item.id,
				name: item.name,
				duration: item.duration,
				type: item.type,
			};
			if (item.skipOnLastLoop !== undefined) {
				interval.skipOnLastLoop = item.skipOnLastLoop;
			}
			// Remove color and sound
			return interval;
		}
	};

	return {
		items: config.items.map(stripItem),
	};
}

/**
 * User preferences interface (matches what will be in database)
 */
export interface UserPreferences {
	colors: {
		prepare: string;
		work: string;
		rest: string;
		loop: string;
		nestedLoop: string;
	};
	defaultAlarm: string;
	isSound: boolean;
	isSpeakNames: boolean;
}

/**
 * Merges user preferences into a minimal workout config (items only).
 * Returns complete AdvancedConfig with preferences applied.
 */
export function mergeUserPreferences(
	config: { items: WorkoutItem[] },
	preferences: UserPreferences,
): AdvancedConfig {
	return {
		items: config.items,
		colors: preferences.colors,
		defaultAlarm: preferences.defaultAlarm,
		speakNames: preferences.isSpeakNames,
	};
}

/**
 * Recursively removes all item-level color overrides from workout items.
 * This resets all items to use workout-level or default colors.
 */
export function clearItemLevelColors(items: WorkoutItem[]): WorkoutItem[] {
	return items.map((item) => {
		if ("loops" in item) {
			// LoopGroup
			const loopGroup: LoopGroup = {
				id: item.id,
				loops: item.loops,
				items: clearItemLevelColors(item.items),
			};
			if (item.collapsed !== undefined) {
				loopGroup.collapsed = item.collapsed;
			}
			// Remove color property
			return loopGroup;
		} else {
			// IntervalStep
			const interval: IntervalStep = {
				id: item.id,
				name: item.name,
				duration: item.duration,
				type: item.type,
			};
			if (item.skipOnLastLoop !== undefined) {
				interval.skipOnLastLoop = item.skipOnLastLoop;
			}
			if (item.sound !== undefined) {
				interval.sound = item.sound;
			}
			// Remove color property
			return interval;
		}
	});
}

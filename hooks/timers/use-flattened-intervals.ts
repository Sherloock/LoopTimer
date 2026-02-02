import {
	flattenWorkoutItems,
	type FlattenedInterval,
} from "@/lib/timer-tree/flatten";
import type { WorkoutItem } from "@/types/advanced-timer";
import { useMemo } from "react";

/**
 * Returns a linear list of intervals in playback order from workout items.
 */
export function useFlattenedIntervals(
	items: WorkoutItem[],
): FlattenedInterval[] {
	return useMemo(() => flattenWorkoutItems(items), [items]);
}

"use client";

// Returns total duration in seconds for a given advanced timer configuration
export interface IntervalStep {
	id: string;
	name: string;
	duration: number;
	type: "prepare" | "work" | "rest";
	skipOnLastLoop?: boolean;
	sound?: string;
}

export interface LoopGroup {
	id: string;
	loops: number;
	items: WorkoutItem[];
	skippedOnLastLoop?: boolean;
}

export type WorkoutItem = IntervalStep | LoopGroup;

// Type guard helpers
const isLoop = (item: WorkoutItem): item is LoopGroup => {
	return (item as LoopGroup).loops !== undefined;
};

/**
 * Computes the total duration for a list of workout items.
 *
 * @param items - The workout items to compute time for
 * @param multiplier - Cumulative multiplier from all parent loops (default 1 at root)
 * @param immediateLoops - Loop count of the immediate parent (for skipOnLastLoop calculation)
 */
export const computeTotalTime = (
	items: WorkoutItem[],
	multiplier: number = 1,
	immediateLoops: number = 1,
): number => {
	let total = 0;

	for (const item of items) {
		if (isLoop(item)) {
			// Recurse with multiplied count and pass this loop's count for skipOnLastLoop handling
			total += computeTotalTime(
				item.items,
				multiplier * item.loops,
				item.loops,
			);
		} else {
			// Calculate effective multiplier based on skipOnLastLoop
			// If skipOnLastLoop is true, skip one iteration of the immediate parent loop
			if (item.skipOnLastLoop) {
				// Reduce multiplier by one iteration of immediate parent
				// Formula: multiplier * (immediateLoops - 1) / immediateLoops
				const adjustedMultiplier =
					immediateLoops > 1 ? multiplier - multiplier / immediateLoops : 0;
				total += item.duration * adjustedMultiplier;
			} else {
				total += item.duration * multiplier;
			}
		}
	}

	return total;
};

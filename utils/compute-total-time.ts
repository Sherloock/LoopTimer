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

export const computeTotalTime = (items: WorkoutItem[]): number => {
	let total = 0;

	for (const item of items) {
		if (isLoop(item)) {
			// Compute inside the loop, multiply by number of loops
			const inner = computeTotalTime(item.items);
			total += inner * item.loops;
		} else {
			total += item.duration;
		}
	}

	return total;
};

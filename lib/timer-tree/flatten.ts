/**
 * Flattens nested workout items (intervals + loops) into a linear list of intervals
 * with loop metadata. Used for playback order.
 */

import {
	type IntervalStep,
	isLoop,
	type WorkoutItem,
} from "@/types/advanced-timer";

const MAX_INTERVALS = 1000;
const MAX_RECURSION_DEPTH = 10;
const MAX_LOOPS = 50;

export interface FlattenedInterval extends IntervalStep {
	originalIndex: number;
	loopInfo?: {
		iteration: number;
		intervalIndex: number;
		parentLoop?: unknown;
	};
}

function getFlattenedIntervals(
	items: WorkoutItem[],
	parentLoopInfo?: { iteration: number; parentLoop?: unknown },
	depth: number = 0,
): FlattenedInterval[] {
	if (depth > MAX_RECURSION_DEPTH) {
		console.warn("Maximum recursion depth reached in loop structure");
		return [];
	}

	const flattened: FlattenedInterval[] = [];

	items.forEach((item, index) => {
		if (flattened.length >= MAX_INTERVALS) {
			console.warn("Maximum interval limit reached");
			return;
		}

		if ("duration" in item && "type" in item) {
			flattened.push({ ...item, originalIndex: index });
			return;
		}

		if (isLoop(item)) {
			const maxLoops = Math.min(item.loops, MAX_LOOPS);
			for (let loop = 1; loop <= maxLoops; loop++) {
				const subItems = getFlattenedIntervals(
					item.items,
					{ iteration: loop, parentLoop: parentLoopInfo },
					depth + 1,
				);
				subItems.forEach((subItem, subIndex) => {
					if (flattened.length >= MAX_INTERVALS) return;
					const isLastLoop = loop === maxLoops;
					const shouldSkip = isLastLoop && subItem.skipOnLastLoop;
					if (shouldSkip) return;
					flattened.push({
						...subItem,
						originalIndex: index,
						loopInfo: {
							iteration: loop,
							intervalIndex: subIndex,
							parentLoop: parentLoopInfo,
						},
					});
				});
			}
		}
	});

	return flattened;
}

/**
 * Returns a linear list of intervals in playback order from a tree of workout items.
 */
export function flattenWorkoutItems(items: WorkoutItem[]): FlattenedInterval[] {
	return getFlattenedIntervals(items);
}

import { flattenWorkoutItems } from "@/lib/timer-tree/flatten";
import type {
	IntervalStep,
	LoopGroup,
	WorkoutItem,
} from "@/types/advanced-timer";

const interval = (
	id: string,
	name: string,
	duration: number,
	opts?: { skipOnLastLoop?: boolean },
): IntervalStep => ({
	id,
	name,
	duration,
	type: "work",
	...opts,
});

const loop = (id: string, items: WorkoutItem[], loops = 2): LoopGroup => ({
	id,
	loops,
	items,
});

describe("flatten", () => {
	describe("flattenWorkoutItems", () => {
		it("flattens flat list of intervals", () => {
			const items: WorkoutItem[] = [
				interval("a", "A", 30),
				interval("b", "B", 60),
			];
			const flat = flattenWorkoutItems(items);
			expect(flat).toHaveLength(2);
			expect(flat[0].id).toBe("a");
			expect(flat[1].id).toBe("b");
			expect(flat[0].originalIndex).toBe(0);
		});

		it("expands loop by loops count", () => {
			const items: WorkoutItem[] = [
				loop("L1", [interval("a", "A", 30), interval("b", "B", 60)], 2),
			];
			const flat = flattenWorkoutItems(items);
			expect(flat).toHaveLength(4); // 2 items × 2 loops
			expect(flat[0].loopInfo?.iteration).toBe(1);
			expect(flat[2].loopInfo?.iteration).toBe(2);
		});

		it("skips interval with skipOnLastLoop on last loop iteration", () => {
			const items: WorkoutItem[] = [
				loop(
					"L1",
					[
						interval("a", "A", 30),
						interval("b", "B", 60, { skipOnLastLoop: true }),
					],
					2,
				),
			];
			const flat = flattenWorkoutItems(items);
			// Loop 1: a, b. Loop 2: a only (b skipped)
			expect(flat).toHaveLength(3);
			expect(flat.map((f) => f.id)).toEqual(["a", "b", "a"]);
		});
	});
});

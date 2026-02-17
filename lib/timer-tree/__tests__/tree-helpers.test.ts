import {
	addItemToLoop,
	findItemById,
	removeItemById,
} from "@/lib/timer-tree/tree-helpers";
import type {
	IntervalStep,
	LoopGroup,
	WorkoutItem,
} from "@/types/advanced-timer";

const interval = (
	id: string,
	name: string,
	duration: number,
): IntervalStep => ({
	id,
	name,
	duration,
	type: "work",
});

const loop = (id: string, items: WorkoutItem[], loops = 2): LoopGroup => ({
	id,
	loops,
	items,
});

describe("tree-helpers", () => {
	describe("findItemById", () => {
		it("finds root-level interval", () => {
			const items: WorkoutItem[] = [
				interval("a", "A", 30),
				interval("b", "B", 60),
			];
			expect(findItemById(items, "b")).toEqual(interval("b", "B", 60));
		});

		it("finds item inside loop", () => {
			const items: WorkoutItem[] = [
				loop("L1", [interval("a", "A", 30), interval("b", "B", 60)]),
			];
			expect(findItemById(items, "b")).toEqual(interval("b", "B", 60));
		});

		it("returns null when not found", () => {
			const items: WorkoutItem[] = [interval("a", "A", 30)];
			expect(findItemById(items, "x")).toBeNull();
		});
	});

	describe("removeItemById", () => {
		it("removes root-level item", () => {
			const items: WorkoutItem[] = [
				interval("a", "A", 30),
				interval("b", "B", 60),
			];
			expect(removeItemById(items, "a")).toEqual([interval("b", "B", 60)]);
		});

		it("removes item inside loop", () => {
			const items: WorkoutItem[] = [
				loop("L1", [interval("a", "A", 30), interval("b", "B", 60)]),
			];
			const result = removeItemById(items, "b");
			expect(result[0]).toHaveProperty("items");
			expect((result[0] as LoopGroup).items).toEqual([interval("a", "A", 30)]);
		});
	});

	describe("addItemToLoop", () => {
		it("adds item to loop by id", () => {
			const items: WorkoutItem[] = [loop("L1", [interval("a", "A", 30)])];
			const newItem = interval("b", "B", 60);
			const result = addItemToLoop(items, "L1", newItem);
			expect((result[0] as LoopGroup).items).toHaveLength(2);
			expect((result[0] as LoopGroup).items[1]).toEqual(newItem);
		});

		it("returns unchanged when loop id not found", () => {
			const items: WorkoutItem[] = [interval("a", "A", 30)];
			const newItem = interval("b", "B", 60);
			expect(addItemToLoop(items, "L1", newItem)).toEqual(items);
		});
	});
});

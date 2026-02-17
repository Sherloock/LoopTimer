import {
	findAndRemoveItem,
	findItemLocation,
	findTargetAndParent,
	insertIntoLoopAfterTarget,
	moveItemDown,
	moveItemUp,
	toggleLoopCollapsed,
	updateItemField,
} from "@/lib/timer-tree/tree-operations";
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

describe("tree-operations", () => {
	describe("findAndRemoveItem", () => {
		it("removes root item and returns it", () => {
			const items: WorkoutItem[] = [
				interval("a", "A", 30),
				interval("b", "B", 60),
			];
			const { items: next, removedItem } = findAndRemoveItem(items, "a");
			expect(next).toEqual([interval("b", "B", 60)]);
			expect(removedItem).toEqual(interval("a", "A", 30));
		});

		it("removes nested item", () => {
			const items: WorkoutItem[] = [
				loop("L1", [interval("a", "A", 30), interval("b", "B", 60)]),
			];
			const { items: next, removedItem } = findAndRemoveItem(items, "b");
			expect((next[0] as LoopGroup).items).toHaveLength(1);
			expect(removedItem).toEqual(interval("b", "B", 60));
		});
	});

	describe("findItemLocation", () => {
		it("returns index at root", () => {
			const items: WorkoutItem[] = [
				interval("a", "A", 30),
				interval("b", "B", 60),
			];
			expect(findItemLocation(items, "b")).toEqual({ index: 1 });
		});

		it("returns loopId and index for nested item", () => {
			const items: WorkoutItem[] = [
				loop("L1", [interval("a", "A", 30), interval("b", "B", 60)]),
			];
			expect(findItemLocation(items, "b")).toEqual({
				loopId: "L1",
				index: 1,
			});
		});

		it("returns null when not found", () => {
			expect(findItemLocation([interval("a", "A", 30)], "x")).toBeNull();
		});
	});

	describe("findTargetAndParent", () => {
		it("returns target and parent loop id", () => {
			const items: WorkoutItem[] = [loop("L1", [interval("a", "A", 30)])];
			const info = findTargetAndParent(items, "a");
			expect(info).not.toBeNull();
			expect(info!.targetItem).toEqual(interval("a", "A", 30));
			expect(info!.parentLoopId).toBe("L1");
			expect(info!.index).toBe(0);
		});
	});

	describe("insertIntoLoopAfterTarget", () => {
		it("inserts item after target in loop", () => {
			const items: WorkoutItem[] = [
				loop("L1", [interval("a", "A", 30), interval("b", "B", 60)]),
			];
			const newItem = interval("c", "C", 45);
			const result = insertIntoLoopAfterTarget(items, "L1", newItem, "a");
			const loopItems = (result[0] as LoopGroup).items;
			expect(loopItems.map((i) => i.id)).toEqual(["a", "c", "b"]);
		});
	});

	describe("moveItemUp", () => {
		it("moves item one position up at root", () => {
			const items: WorkoutItem[] = [
				interval("a", "A", 30),
				interval("b", "B", 60),
			];
			const result = moveItemUp(items, "b");
			expect(result.map((i) => i.id)).toEqual(["b", "a"]);
		});

		it("does nothing for first item", () => {
			const items: WorkoutItem[] = [
				interval("a", "A", 30),
				interval("b", "B", 60),
			];
			expect(moveItemUp(items, "a")).toEqual(items);
		});
	});

	describe("moveItemDown", () => {
		it("moves item one position down at root", () => {
			const items: WorkoutItem[] = [
				interval("a", "A", 30),
				interval("b", "B", 60),
			];
			const result = moveItemDown(items, "a");
			expect(result.map((i) => i.id)).toEqual(["b", "a"]);
		});

		it("does nothing for last item", () => {
			const items: WorkoutItem[] = [
				interval("a", "A", 30),
				interval("b", "B", 60),
			];
			expect(moveItemDown(items, "b")).toEqual(items);
		});
	});

	describe("toggleLoopCollapsed", () => {
		it("toggles collapsed on loop", () => {
			const items: WorkoutItem[] = [loop("L1", [interval("a", "A", 30)])];
			const open = (items[0] as LoopGroup).collapsed;
			const result = toggleLoopCollapsed(items, "L1");
			expect((result[0] as LoopGroup).collapsed).toBe(!open);
		});
	});

	describe("updateItemField", () => {
		it("updates duration and clamps to min 1", () => {
			const items: WorkoutItem[] = [interval("a", "A", 30)];
			const result = updateItemField(items, "a", "duration", 0);
			expect((result[0] as IntervalStep).duration).toBe(1);
		});

		it("updates name", () => {
			const items: WorkoutItem[] = [interval("a", "A", 30)];
			const result = updateItemField(items, "a", "name", "New Name");
			expect((result[0] as IntervalStep).name).toBe("New Name");
		});
	});
});

import { isLoop, type WorkoutItem } from "@/types/advanced-timer";

export function findItemById(
	items: WorkoutItem[],
	id: string,
): WorkoutItem | null {
	for (const item of items) {
		if (item.id === id) return item;
		if (isLoop(item)) {
			const found = findItemById(item.items, id);
			if (found) return found;
		}
	}
	return null;
}

export function removeItemById(
	items: WorkoutItem[],
	id: string,
): WorkoutItem[] {
	return items
		.filter((item) => item.id !== id)
		.map((item) => {
			if (isLoop(item)) {
				return { ...item, items: removeItemById(item.items, id) };
			}
			return item;
		});
}

export function addItemToLoop(
	items: WorkoutItem[],
	loopId: string,
	newItem: WorkoutItem,
): WorkoutItem[] {
	return items.map((item) => {
		if (item.id === loopId && isLoop(item)) {
			// Allow adding any type of item (including loops) inside loops
			return { ...item, items: [...item.items, newItem] };
		}
		if (isLoop(item)) {
			return { ...item, items: addItemToLoop(item.items, loopId, newItem) };
		}
		return item;
	});
}

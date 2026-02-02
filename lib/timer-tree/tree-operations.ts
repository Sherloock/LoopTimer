/**
 * Tree manipulation utilities for the nested timer structure.
 * These functions work with WorkoutItem trees (IntervalStep | LoopGroup).
 */

import {
	isLoop,
	type LoopGroup,
	type WorkoutItem,
} from "@/types/advanced-timer";

// Re-export existing utilities for convenience
export {
	addItemToLoop,
	findItemById,
	removeItemById,
} from "@/components/timers/editor/advanced/advanced-timer-tree";

/**
 * Result of finding and removing an item from the tree.
 */
export interface FindAndRemoveResult {
	items: WorkoutItem[];
	removedItem: WorkoutItem | null;
}

/**
 * Location information for an item in the tree.
 */
export interface ItemLocation {
	loopId?: string;
	index: number;
}

/**
 * Extended location info including the target item itself.
 */
export interface TargetAndParentInfo {
	targetItem: WorkoutItem;
	parentLoopId?: string;
	index: number;
}

/**
 * Finds and removes an item from anywhere in the tree structure.
 * Returns both the modified tree and the removed item.
 */
export function findAndRemoveItem(
	items: WorkoutItem[],
	targetId: string,
): FindAndRemoveResult {
	let removedItem: WorkoutItem | null = null;

	const newItems = items
		.filter((item) => {
			if (item.id === targetId) {
				removedItem = item;
				return false;
			}
			return true;
		})
		.map((item) => {
			if (isLoop(item)) {
				const result = findAndRemoveItem(item.items, targetId);
				if (result.removedItem && !removedItem) {
					removedItem = result.removedItem;
				}
				return { ...item, items: result.items };
			}
			return item;
		});

	return { items: newItems, removedItem };
}

/**
 * Finds the location (parent loop and index) of an item in the tree.
 */
export function findItemLocation(
	items: WorkoutItem[],
	targetId: string,
	parentLoopId?: string,
): ItemLocation | null {
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		if (item.id === targetId) {
			return { loopId: parentLoopId, index: i };
		}
		if (isLoop(item)) {
			const found = findItemLocation(item.items, targetId, item.id);
			if (found) return found;
		}
	}
	return null;
}

/**
 * Finds a target item and its parent loop information.
 */
export function findTargetAndParent(
	items: WorkoutItem[],
	targetId: string,
	parentLoopId?: string,
): TargetAndParentInfo | null {
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		if (item.id === targetId) {
			return { targetItem: item, parentLoopId, index: i };
		}
		if (isLoop(item)) {
			const found = findTargetAndParent(item.items, targetId, item.id);
			if (found) return found;
		}
	}
	return null;
}

/**
 * Inserts an item into a specific loop at a position relative to a target item.
 */
export function insertIntoLoopAtPosition(
	items: WorkoutItem[],
	targetLoopId: string,
	itemToInsert: WorkoutItem,
	position: "before" | "after",
	targetItemId: string,
): WorkoutItem[] {
	return items.map((item) => {
		if (isLoop(item) && item.id === targetLoopId) {
			const newItems = [...item.items];
			const targetIndex = newItems.findIndex(
				(subItem) => subItem.id === targetItemId,
			);

			if (targetIndex !== -1) {
				const insertIndex =
					position === "before" ? targetIndex : targetIndex + 1;
				newItems.splice(insertIndex, 0, itemToInsert);
			} else {
				// Fallback: append to end
				newItems.push(itemToInsert);
			}

			return { ...item, items: newItems };
		} else if (isLoop(item)) {
			return {
				...item,
				items: insertIntoLoopAtPosition(
					item.items,
					targetLoopId,
					itemToInsert,
					position,
					targetItemId,
				),
			};
		}
		return item;
	});
}

/**
 * Inserts an item after a target item within a specific loop.
 */
export function insertIntoLoopAfterTarget(
	items: WorkoutItem[],
	targetLoopId: string,
	itemToInsert: WorkoutItem,
	targetItemId: string,
): WorkoutItem[] {
	return items.map((item) => {
		if (isLoop(item) && item.id === targetLoopId) {
			const newItems = [...item.items];
			const targetIndex = newItems.findIndex(
				(subItem) => subItem.id === targetItemId,
			);

			if (targetIndex !== -1) {
				// Insert after the target item
				newItems.splice(targetIndex + 1, 0, itemToInsert);
			} else {
				// Fallback: append to end
				newItems.push(itemToInsert);
			}

			return { ...item, items: newItems };
		} else if (isLoop(item)) {
			return {
				...item,
				items: insertIntoLoopAfterTarget(
					item.items,
					targetLoopId,
					itemToInsert,
					targetItemId,
				),
			};
		}
		return item;
	});
}

/**
 * Moves an item one position up within its current container.
 */
export function moveItemUp(
	items: WorkoutItem[],
	targetId: string,
): WorkoutItem[] {
	const itemIndex = items.findIndex((item) => item.id === targetId);
	if (itemIndex > 0) {
		// Move the item one position up
		const newItems = [...items];
		[newItems[itemIndex - 1], newItems[itemIndex]] = [
			newItems[itemIndex],
			newItems[itemIndex - 1],
		];
		return newItems;
	}

	// If item not found at this level, check nested loops
	return items.map((item) => {
		if (isLoop(item)) {
			return { ...item, items: moveItemUp(item.items, targetId) };
		}
		return item;
	});
}

/**
 * Moves an item one position down within its current container.
 */
export function moveItemDown(
	items: WorkoutItem[],
	targetId: string,
): WorkoutItem[] {
	const itemIndex = items.findIndex((item) => item.id === targetId);
	if (itemIndex >= 0 && itemIndex < items.length - 1) {
		// Move the item one position down
		const newItems = [...items];
		[newItems[itemIndex], newItems[itemIndex + 1]] = [
			newItems[itemIndex + 1],
			newItems[itemIndex],
		];
		return newItems;
	}

	// If item not found at this level, check nested loops
	return items.map((item) => {
		if (isLoop(item)) {
			return { ...item, items: moveItemDown(item.items, targetId) };
		}
		return item;
	});
}

/**
 * Finds the root-level loop item that corresponds to a loopInfo structure.
 */
export function findLoopItemByInfo(
	items: WorkoutItem[],
	targetInfo: { parentLoop?: unknown },
): LoopGroup | null {
	for (const item of items) {
		if (isLoop(item)) {
			// This is a root-level loop if targetInfo has no parentLoop
			if (!targetInfo.parentLoop) {
				return item;
			}
			// Otherwise, search deeper
			const found = findLoopItemByInfo(item.items, targetInfo);
			if (found) return found;
		}
	}
	return null;
}

/**
 * Toggles the collapsed state of a loop.
 */
export function toggleLoopCollapsed(
	items: WorkoutItem[],
	targetId: string,
): WorkoutItem[] {
	return items.map((item) => {
		if (item.id === targetId && isLoop(item)) {
			return { ...item, collapsed: !item.collapsed };
		}
		if (isLoop(item)) {
			return { ...item, items: toggleLoopCollapsed(item.items, targetId) };
		}
		return item;
	});
}

/**
 * Updates a single field on an item (interval or loop).
 */
export function updateItemField(
	items: WorkoutItem[],
	targetId: string,
	field: string,
	value: unknown,
): WorkoutItem[] {
	return items.map((item) => {
		if (item.id === targetId) {
			return {
				...item,
				[field]: field === "duration" ? Math.max(1, Number(value)) : value,
			};
		}
		if (isLoop(item)) {
			return {
				...item,
				items: updateItemField(item.items, targetId, field, value),
			};
		}
		return item;
	});
}

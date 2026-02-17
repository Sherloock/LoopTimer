/**
 * Hook for managing timer configuration CRUD operations.
 * Handles adding, removing, updating, moving, and duplicating workout items.
 */

import { useIdGenerator } from "@/hooks/timers/use-id-generator";
import {
	addItemToLoop,
	findAndRemoveItem,
	removeItemById,
	toggleLoopCollapsed,
	moveItemDown as treeItemDown,
	moveItemUp as treeItemUp,
	updateItemField,
} from "@/lib/timer-tree/tree-operations";
import {
	type AdvancedConfig,
	type IntervalStep,
	isInterval,
	isLoop,
	type LoopGroup,
	type WorkoutItem,
} from "@/types/advanced-timer";
import { useCallback, useState } from "react";

interface UseTimerConfigManagementOptions {
	initialConfig: AdvancedConfig;
	initialNextId?: number;
}

export interface TimerConfigManagementResult {
	config: AdvancedConfig;
	setConfig: React.Dispatch<React.SetStateAction<AdvancedConfig>>;
	generateId: () => string;
	setNextId: (id: number) => void;
	// CRUD operations
	addInterval: () => void;
	addLoop: () => void;
	addToLoop: (loopId: string) => void;
	removeItem: (id: string) => void;
	updateItem: (id: string, field: string, value: unknown) => void;
	toggleLoopCollapse: (id: string) => void;
	duplicateItem: (id: string) => void;
	// Move operations
	moveToTop: (id: string) => void;
	moveToBottom: (id: string) => void;
	moveUp: (id: string) => void;
	moveDown: (id: string) => void;
}

export function useTimerConfigManagement({
	initialConfig,
	initialNextId,
}: UseTimerConfigManagementOptions): TimerConfigManagementResult {
	const [config, setConfig] = useState<AdvancedConfig>(initialConfig);
	const { generateId, setNextId } = useIdGenerator(initialNextId);

	// ==================== CRUD Operations ====================

	const addInterval = useCallback(() => {
		const newInterval: IntervalStep = {
			id: generateId(),
			name: "NEW EXERCISE",
			duration: 30,
			type: "work",
			sound: undefined,
		};
		setConfig((prev) => ({
			...prev,
			items: [...prev.items, newInterval],
		}));
	}, [generateId]);

	const addLoop = useCallback(() => {
		const newLoop: LoopGroup = {
			id: generateId(),
			loops: 3,
			items: [],
			collapsed: false,
		};
		setConfig((prev) => ({
			...prev,
			items: [...prev.items, newLoop],
		}));
	}, [generateId]);

	const addToLoop = useCallback(
		(loopId: string) => {
			const newInterval: IntervalStep = {
				id: generateId(),
				name: "NEW EXERCISE",
				duration: 30,
				type: "work",
				sound: undefined,
			};

			setConfig((prev) => ({
				...prev,
				items: addItemToLoop(prev.items, loopId, newInterval),
			}));
		},
		[generateId],
	);

	const removeItem = useCallback((id: string) => {
		setConfig((prev) => ({
			...prev,
			items: removeItemById(prev.items, id),
		}));
	}, []);

	const updateItem = useCallback(
		(id: string, field: string, value: unknown) => {
			setConfig((prev) => ({
				...prev,
				items: updateItemField(prev.items, id, field, value),
			}));
		},
		[],
	);

	const toggleLoopCollapse = useCallback((id: string) => {
		setConfig((prev) => ({
			...prev,
			items: toggleLoopCollapsed(prev.items, id),
		}));
	}, []);

	const duplicateItem = useCallback(
		(id: string) => {
			const duplicateRecursive = (items: WorkoutItem[]): WorkoutItem[] => {
				const newItems: WorkoutItem[] = [];

				for (const item of items) {
					newItems.push(item);

					if (item.id === id) {
						// Create a duplicate with a new ID
						if (isInterval(item)) {
							const duplicate: IntervalStep = {
								...item,
								id: generateId(),
								name: `${item.name}`,
							};
							newItems.push(duplicate);
						} else if (isLoop(item)) {
							// Deep clone loop with fresh IDs for all children
							const deepCloneLoop = (loop: LoopGroup): LoopGroup => {
								const newLoopId = generateId();
								return {
									...loop,
									id: newLoopId,
									loops: loop.loops,
									items: loop.items.map((child) => {
										if (isLoop(child)) {
											return deepCloneLoop(child);
										}
										return { ...child, id: generateId() };
									}),
								};
							};
							newItems.push(deepCloneLoop(item));
						}
					} else if (isLoop(item)) {
						// Update the last added item if it's a loop
						const lastItem = newItems[newItems.length - 1];
						if (isLoop(lastItem)) {
							newItems[newItems.length - 1] = {
								...lastItem,
								items: duplicateRecursive(lastItem.items),
							};
						}
					}
				}

				return newItems;
			};

			setConfig((prev) => ({
				...prev,
				items: duplicateRecursive(prev.items),
			}));
		},
		[generateId],
	);

	// ==================== Move Operations ====================

	const moveToTop = useCallback((id: string) => {
		setConfig((prev) => {
			const result = findAndRemoveItem(prev.items, id);
			if (result.removedItem) {
				return { ...prev, items: [result.removedItem, ...result.items] };
			}
			return prev;
		});
	}, []);

	const moveToBottom = useCallback((id: string) => {
		setConfig((prev) => {
			const result = findAndRemoveItem(prev.items, id);
			if (result.removedItem) {
				return { ...prev, items: [...result.items, result.removedItem] };
			}
			return prev;
		});
	}, []);

	const moveUp = useCallback((id: string) => {
		setConfig((prev) => ({
			...prev,
			items: treeItemUp(prev.items, id),
		}));
	}, []);

	const moveDown = useCallback((id: string) => {
		setConfig((prev) => ({
			...prev,
			items: treeItemDown(prev.items, id),
		}));
	}, []);

	return {
		config,
		setConfig,
		generateId,
		setNextId,
		// CRUD operations
		addInterval,
		addLoop,
		addToLoop,
		removeItem,
		updateItem,
		toggleLoopCollapse,
		duplicateItem,
		// Move operations
		moveToTop,
		moveToBottom,
		moveUp,
		moveDown,
	};
}

/**
 * Hook for managing drag-and-drop operations on the timer tree.
 * Handles all DnD scenarios: dropping into loops, before/after positions,
 * root level, and reordering within containers.
 */

import {
	addItemToLoop,
	findAndRemoveItem,
	findItemById,
	findItemLocation,
	findTargetAndParent,
	insertIntoLoopAfterTarget,
	insertIntoLoopAtPosition,
	type ItemLocation,
} from "@/lib/timer-tree/tree-operations";
import {
	type AdvancedConfig,
	isLoop,
	type WorkoutItem,
} from "@/types/advanced-timer";
import {
	closestCenter,
	type DragEndEvent,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback, useState } from "react";

// ==================== Drop Scenario Types ====================

type DropScenario =
	| "loop-interior"
	| "loop-header"
	| "before-after"
	| "main-container"
	| "item-direct"
	| "same-loop-reorder"
	| "loop-to-root"
	| "root-reorder"
	| "unknown";

// ==================== Helper Functions ====================

/**
 * Categorizes the drop target to determine which scenario handler to use.
 */
function categorizeDropTarget(
	overIdStr: string,
	activeIdStr: string,
	overItemObj: WorkoutItem | null,
	activeLocation: ItemLocation | null,
	overLocation: ItemLocation | null,
): DropScenario {
	// CASE A: Dropped inside an existing loop (empty interior area)
	if (
		(overIdStr.startsWith("drop-") &&
			!overIdStr.startsWith("drop-before-") &&
			!overIdStr.startsWith("drop-after-")) ||
		overIdStr.startsWith("empty-")
	) {
		return "loop-interior";
	}

	// CASE B: Dropped on a loop header (prepend to loop)
	if (overItemObj && isLoop(overItemObj)) {
		return "loop-header";
	}

	// CASE C: Dropped on before/after drop zones
	if (
		overIdStr.startsWith("drop-before-") ||
		overIdStr.startsWith("drop-after-")
	) {
		return "before-after";
	}

	// CASE D: Dropped on main container area
	if (overIdStr === "main-container") {
		return "main-container";
	}

	// CASE E: Dropped directly on another item
	if (overLocation && activeIdStr !== overIdStr) {
		// CASE F: Same-loop reorder
		if (
			activeLocation?.loopId &&
			activeLocation.loopId === overLocation.loopId
		) {
			return "same-loop-reorder";
		}

		// CASE G: Moving from loop to root
		if (activeLocation?.loopId && !overLocation.loopId) {
			return "loop-to-root";
		}

		// CASE H: Root-level reorder
		if (!activeLocation?.loopId && !overLocation.loopId) {
			return "root-reorder";
		}

		return "item-direct";
	}

	return "unknown";
}

// ==================== Scenario Handlers ====================

interface ScenarioContext {
	activeIdStr: string;
	overIdStr: string;
	activeLocation: ItemLocation | null;
	overLocation: ItemLocation | null;
}

/**
 * CASE A: Drop into loop interior (empty area).
 */
function handleDropIntoLoop(
	prev: AdvancedConfig,
	ctx: ScenarioContext,
): AdvancedConfig {
	const targetLoopId = ctx.overIdStr.replace("drop-", "").replace("empty-", "");

	// Guard: Prevent dropping into itself
	if (targetLoopId === ctx.activeIdStr) {
		return prev;
	}

	const result = findAndRemoveItem(prev.items, ctx.activeIdStr);
	if (result.removedItem) {
		return {
			...prev,
			items: addItemToLoop(result.items, targetLoopId, result.removedItem),
		};
	}
	return prev;
}

/**
 * CASE B: Drop on loop header (prepend to loop).
 */
function handleDropOntoLoopHeader(
	prev: AdvancedConfig,
	ctx: ScenarioContext,
): AdvancedConfig {
	// Guard: Don't insert a loop into itself
	if (ctx.overIdStr === ctx.activeIdStr) {
		return prev;
	}

	const result = findAndRemoveItem(prev.items, ctx.activeIdStr);
	if (!result.removedItem) {
		return prev;
	}

	const insertAtStart = (items: WorkoutItem[]): WorkoutItem[] => {
		return items.map((item) => {
			if (isLoop(item) && item.id === ctx.overIdStr) {
				return {
					...item,
					items: [result.removedItem!, ...item.items],
				};
			}
			if (isLoop(item)) {
				return { ...item, items: insertAtStart(item.items) };
			}
			return item;
		});
	};

	return { ...prev, items: insertAtStart(result.items) };
}

/**
 * CASE C: Drop on before/after zones.
 */
function handleDropBeforeAfter(
	prev: AdvancedConfig,
	ctx: ScenarioContext,
): AdvancedConfig {
	const isBefore = ctx.overIdStr.startsWith("drop-before-");
	const targetItemId = ctx.overIdStr
		.replace("drop-before-", "")
		.replace("drop-after-", "");

	// Guard: Don't drop into own zone
	if (targetItemId === ctx.activeIdStr) {
		return prev;
	}

	const result = findAndRemoveItem(prev.items, ctx.activeIdStr);
	if (!result.removedItem) {
		return prev;
	}

	const targetInfo = findTargetAndParent(result.items, targetItemId);
	if (!targetInfo) {
		return prev;
	}

	if (targetInfo.parentLoopId) {
		// Insert into the parent loop at the correct position
		return {
			...prev,
			items: insertIntoLoopAtPosition(
				result.items,
				targetInfo.parentLoopId,
				result.removedItem,
				isBefore ? "before" : "after",
				targetItemId,
			),
		};
	} else {
		// Insert at root level
		const newItems = [...result.items];
		const insertIndex = isBefore ? targetInfo.index : targetInfo.index + 1;
		newItems.splice(insertIndex, 0, result.removedItem);
		return { ...prev, items: newItems };
	}
}

/**
 * CASE D: Drop on main container (append to root).
 */
function handleDropOnMainContainer(
	prev: AdvancedConfig,
	ctx: ScenarioContext,
): AdvancedConfig {
	const result = findAndRemoveItem(prev.items, ctx.activeIdStr);
	if (result.removedItem) {
		return { ...prev, items: [...result.items, result.removedItem] };
	}
	return prev;
}

/**
 * CASE E: Drop directly on another item (insert after).
 */
function handleDropOntoItem(
	prev: AdvancedConfig,
	ctx: ScenarioContext,
): AdvancedConfig {
	if (!ctx.overLocation) return prev;

	const result = findAndRemoveItem(prev.items, ctx.activeIdStr);
	if (!result.removedItem) {
		return prev;
	}

	if (ctx.overLocation.loopId) {
		// Insert into loop after target
		return {
			...prev,
			items: insertIntoLoopAfterTarget(
				result.items,
				ctx.overLocation.loopId,
				result.removedItem,
				ctx.overIdStr,
			),
		};
	} else {
		// Insert at root level after target
		const newItems = [...result.items];
		newItems.splice(ctx.overLocation.index + 1, 0, result.removedItem);
		return { ...prev, items: newItems };
	}
}

/**
 * CASE F: Reorder within the same loop.
 */
function handleSameLoopReorder(
	prev: AdvancedConfig,
	ctx: ScenarioContext,
): AdvancedConfig {
	if (!ctx.activeLocation?.loopId) return prev;

	const reorderInLoop = (items: WorkoutItem[]): WorkoutItem[] => {
		return items.map((item) => {
			if (isLoop(item) && item.id === ctx.activeLocation!.loopId) {
				const activeIndex = item.items.findIndex(
					(subItem) => subItem.id === ctx.activeIdStr,
				);
				const overIndex = item.items.findIndex(
					(subItem) => subItem.id === ctx.overIdStr,
				);

				if (activeIndex !== -1 && overIndex !== -1) {
					return {
						...item,
						items: arrayMove(item.items, activeIndex, overIndex),
					};
				}
			} else if (isLoop(item)) {
				return { ...item, items: reorderInLoop(item.items) };
			}
			return item;
		});
	};

	return { ...prev, items: reorderInLoop(prev.items) };
}

/**
 * CASE G: Move from inside a loop to root level.
 */
function handleLoopToRoot(
	prev: AdvancedConfig,
	ctx: ScenarioContext,
): AdvancedConfig {
	if (!ctx.overLocation) return prev;

	const result = findAndRemoveItem(prev.items, ctx.activeIdStr);
	if (result.removedItem) {
		const newItems = [...result.items];
		newItems.splice(ctx.overLocation.index, 0, result.removedItem);
		return { ...prev, items: newItems };
	}
	return prev;
}

/**
 * CASE H: Root-level reorder.
 */
function handleRootReorder(
	prev: AdvancedConfig,
	ctx: ScenarioContext,
): AdvancedConfig {
	if (!ctx.overLocation) return prev;

	const result = findAndRemoveItem(prev.items, ctx.activeIdStr);
	if (result.removedItem) {
		const newItems = [...result.items];
		newItems.splice(ctx.overLocation.index, 0, result.removedItem);
		return { ...prev, items: newItems };
	}
	return prev;
}

// ==================== Main Hook ====================

interface UseTimerDragAndDropOptions {
	config: AdvancedConfig;
	setConfig: React.Dispatch<React.SetStateAction<AdvancedConfig>>;
}

export interface TimerDragAndDropResult {
	activeId: string | null;
	sensors: ReturnType<typeof useSensors>;
	collisionDetection: typeof closestCenter;
	handleDragStart: (event: DragStartEvent) => void;
	handleDragEnd: (event: DragEndEvent) => void;
}

export function useTimerDragAndDrop({
	config,
	setConfig,
}: UseTimerDragAndDropOptions): TimerDragAndDropResult {
	const [activeId, setActiveId] = useState<string | null>(null);

	// Configure sensors for mouse, touch, and keyboard
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // Increased for better touch compatibility
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 50, // Reduced delay for better responsiveness
				tolerance: 12, // Increased tolerance for touch imprecision
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	}, []);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			setActiveId(null);

			// Bail out when dropped outside a valid zone
			if (!over) return;

			const activeIdStr = active.id as string;
			const overIdStr = over.id as string;

			// Get location and object information
			const activeLocation = findItemLocation(config.items, activeIdStr);
			const overLocation = findItemLocation(config.items, overIdStr);
			const overItemObj = findItemById(config.items, overIdStr);

			// Determine the drop scenario
			const scenario = categorizeDropTarget(
				overIdStr,
				activeIdStr,
				overItemObj,
				activeLocation,
				overLocation,
			);

			const ctx: ScenarioContext = {
				activeIdStr,
				overIdStr,
				activeLocation,
				overLocation,
			};

			// Dispatch to the appropriate handler
			setConfig((prev) => {
				switch (scenario) {
					case "loop-interior":
						return handleDropIntoLoop(prev, ctx);
					case "loop-header":
						return handleDropOntoLoopHeader(prev, ctx);
					case "before-after":
						return handleDropBeforeAfter(prev, ctx);
					case "main-container":
						return handleDropOnMainContainer(prev, ctx);
					case "item-direct":
						return handleDropOntoItem(prev, ctx);
					case "same-loop-reorder":
						return handleSameLoopReorder(prev, ctx);
					case "loop-to-root":
						return handleLoopToRoot(prev, ctx);
					case "root-reorder":
						return handleRootReorder(prev, ctx);
					default:
						return prev;
				}
			});
		},
		[config.items, setConfig],
	);

	return {
		activeId,
		sensors,
		collisionDetection: closestCenter,
		handleDragStart,
		handleDragEnd,
	};
}

"use client";

import { Checkbox } from "@/components/timers/editor/advanced/dnd/checkbox";
import {
	addItemToLoop,
	findItemById,
	removeItemById,
} from "@/components/timers/editor/advanced/advanced-timer-tree";
import { DroppableZone } from "@/components/timers/editor/advanced/dnd/droppable-zone";
import { useIdGenerator } from "@/components/timers/editor/advanced/use-id-generator";
import { MinimalisticContainer } from "@/components/timers/player/minimalistic-container";
import { RunningTimerView } from "@/components/timers/player/running-timer-view";
import { TimerCompletionScreen } from "@/components/timers/player/timer-completion-screen";
import { TimerControls } from "@/components/timers/player/timer-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { useTimerState } from "@/hooks/use-timer-state";
import { useSaveTimer, useTimers, useUpdateTimer } from "@/hooks/use-timers";
import {
	ADVANCED_TIMER_DEFAULT_COLORS,
	TIMER_NAME_MAX_LENGTH,
} from "@/lib/constants/timers";
import { playSound, SOUND_OPTIONS, speakText, stopAllSounds } from "@/lib/sound-utils";
import { formatTime, getProgress, timerToasts } from "@/lib/timer-utils";
import {
	getIntervalTypeForDisplay,
	mapIntervalTypeToTimerType,
	TimerType,
} from "@/utils/timer-shared";
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useDndMonitor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
	ArrowLeft,
	Repeat,
	Save as SaveIcon,
	Settings,
	Undo,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// Externalised components
import { SortableItem } from "@/components/timers/editor/advanced/dnd/sortable-item";
import {
	AdvancedConfig,
	ColorSettings,
	IntervalStep,
	isInterval,
	isLoop,
	LoadedTimer,
	LoopGroup,
	WorkoutItem,
} from "@/types/advanced-timer";

interface AdvancedTimerProps {
	loadedTimer?: LoadedTimer;
	onSaved?: (t: any) => void;
	onTimerNameChange?: (name: string) => void;
	editMode?: boolean;
	autoStart?: boolean;
	onExit?: () => void;
	onSaveComplete?: () => void;
	onComplete?: (timerName: string) => void;
	onMinimalisticViewChange?: (isMinimalistic: boolean) => void;
}

export function AdvancedTimer({
	loadedTimer,
	onSaved,
	onTimerNameChange,
	editMode = false,
	autoStart = false,
	onExit,
	onSaveComplete,
	onComplete,
	onMinimalisticViewChange,
}: AdvancedTimerProps) {
	const { setNextId, generateId } = useIdGenerator();

	const [config, setConfig] = useState<AdvancedConfig>({
		items: [
			{
				id: "1",
				name: "PREPARE",
				duration: 5,
				type: "prepare",
			},
			{
				id: "2",
				loops: 3,
				items: [
					{ id: "3", name: "WORK", duration: 30, type: "work" },
					{ id: "4", name: "REST", duration: 10, type: "rest" },
				],
				collapsed: false,
			},
		],
		colors: ADVANCED_TIMER_DEFAULT_COLORS,
		defaultAlarm: "beep-1x",
		speakNames: true,
	});

	// Update config when a saved timer is loaded
	useEffect(() => {
		if (loadedTimer?.data) {
			// Allow nested loops - remove sanitization that prevented loop nesting
			const sanitizeConfig = (data: AdvancedConfig): AdvancedConfig => {
				// Simply return the data as-is to allow full nesting capability
				return data;
			};

			const normalized = sanitizeConfig(loadedTimer.data as AdvancedConfig);
			setConfig(normalized);

			// update next id to avoid collisions
			const extractIds = (items: WorkoutItem[]): number[] => {
				return items.reduce<number[]>((acc, item) => {
					acc.push(parseInt(item.id, 10));
					if (isLoop(item)) {
						acc.push(...extractIds(item.items));
					}
					return acc;
				}, []);
			};

			const ids = extractIds(normalized.items ?? []);
			const maxId = ids.length ? Math.max(...ids) : 0;
			setNextId(maxId + 1);
		}
	}, [loadedTimer, setNextId]);

	const [activeId, setActiveId] = useState<string | null>(null);
	const [currentType, setCurrentType] = useState<TimerType>("prepare");
	const [timeLeft, setTimeLeft] = useState(0);
	const [currentItemIndex, setCurrentItemIndex] = useState(0);
	const [showSettings, setShowSettings] = useState(false);

	const {
		state,
		currentSet,
		setCurrentSet,
		isHolding,
		holdProgress,
		startTimer: baseStartTimer,
		pauseTimer,
		resetTimer: baseResetTimer,
		stopTimer: baseStopTimer,
		handleHoldStart: baseHoldStart,
		handleHoldEnd,
		setCompleted,
	} = useTimerState();

	const { mutate: saveTimer, isPending: isSaving } = useSaveTimer();
	const { mutate: overwriteTimer, isPending: isUpdating } = useUpdateTimer();
	const { data: existingTimers } = useTimers();
	const isSavingOrUpdating = isSaving || isUpdating;

	// Timer name handling
	const [timerName, setTimerName] = useState<string>(loadedTimer?.name || "");

	// Update timer name when loadedTimer changes
	useEffect(() => {
		if (loadedTimer?.name) {
			setTimerName(loadedTimer.name.slice(0, TIMER_NAME_MAX_LENGTH));
		}
	}, [loadedTimer?.name]);

	// Notify parent component when timer name changes
	const handleTimerNameChange = (name: string) => {
		const nextName = name.slice(0, TIMER_NAME_MAX_LENGTH);
		setTimerName(nextName);
		onTimerNameChange?.(nextName);
	};

	// Dialog state
	const [saveOpen, setSaveOpen] = useState(false);

	// Memoized flatten function with safeguards
	const flattenedIntervals = useMemo(() => {
		const MAX_INTERVALS = 1000; // Prevent memory crashes
		const MAX_RECURSION_DEPTH = 10; // Prevent infinite recursion

		const getFlattenedIntervals = (
			items: WorkoutItem[],
			parentLoopInfo?: any,
			depth: number = 0,
		): Array<
			IntervalStep & {
				originalIndex: number;
				loopInfo?: {
					iteration: number;
					intervalIndex: number;
					parentLoop?: any;
				};
			}
		> => {
			// Prevent infinite recursion
			if (depth > MAX_RECURSION_DEPTH) {
				console.warn("Maximum recursion depth reached in loop structure");
				return [];
			}

			const flattened: Array<
				IntervalStep & {
					originalIndex: number;
					loopInfo?: {
						iteration: number;
						intervalIndex: number;
						parentLoop?: any;
					};
				}
			> = [];

			items.forEach((item, index) => {
				// Check if we're approaching memory limit
				if (flattened.length > MAX_INTERVALS) {
					console.warn(
						"Maximum interval limit reached to prevent memory crash",
					);
					return;
				}

				if (isInterval(item)) {
					flattened.push({ ...item, originalIndex: index });
				} else if (isLoop(item)) {
					// Limit loop iterations to prevent exponential growth
					const maxLoops = Math.min(item.loops, 50); // Cap at 50 iterations

					for (let loop = 1; loop <= maxLoops; loop++) {
						const subItems = getFlattenedIntervals(
							item.items,
							{
								iteration: loop,
								parentLoop: parentLoopInfo,
							},
							depth + 1,
						);

						subItems.forEach((subItem, subIndex) => {
							if (flattened.length < MAX_INTERVALS) {
								// Check if this item should be skipped on the last loop iteration
								const isLastLoop = loop === maxLoops;
								const shouldSkip = isLastLoop && subItem.skipOnLastLoop;

								if (!shouldSkip) {
									flattened.push({
										...subItem,
										originalIndex: index,
										loopInfo: {
											iteration: loop,
											intervalIndex: subIndex,
											parentLoop: parentLoopInfo,
										},
									});
								}
							}
						});
					}
				}
			});

			return flattened;
		};

		return getFlattenedIntervals(config.items);
	}, [config.items]);

	// Enhanced validation function to check for nested loops - REMOVED to allow nesting
	// const validateTimerStructure = useCallback(
	// 	(items: WorkoutItem[]): boolean => {
	// 		const checkNestedLoops = (items: WorkoutItem[], depth = 0): boolean => {
	// 			for (const item of items) {
	// 				if (isLoop(item)) {
	// 					// If we're already inside a loop (depth > 0), nested loops are not allowed
	// 					if (depth > 0) {
	// 						return false;
	// 					}
	// 					// Recursively check the loop's items
	// 					if (!checkNestedLoops(item.items, depth + 1)) {
	// 						return false;
	// 					}
	// 				}
	// 			}
	// 			return true;
	// 		};
	// 		return checkNestedLoops(items);
	// 	},
	// 	[],
	// );

	// Drag and drop sensors - optimized for mobile
	const sensors = useSensors(
		// Pointer sensor for mouse interactions (desktop)
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // Increased for better touch compatibility
			},
		}),
		// Touch sensor for mobile devices - optimized settings
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 50, // Reduced delay for better responsiveness
				tolerance: 12, // Increased tolerance for touch imprecision
			},
		}),
		// Keyboard sensor for accessibility
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	// Move to top/bottom functions
	const moveToTop = useCallback((id: string) => {
		setConfig((prev) => {
			// First, find and remove the item from anywhere in the structure
			const findAndRemoveItem = (
				items: WorkoutItem[],
			): { items: WorkoutItem[]; removedItem: WorkoutItem | null } => {
				let removedItem: WorkoutItem | null = null;

				const newItems = items
					.filter((item) => {
						if (item.id === id) {
							removedItem = item;
							return false;
						}
						return true;
					})
					.map((item) => {
						if (isLoop(item)) {
							const result = findAndRemoveItem(item.items);
							if (result.removedItem && !removedItem) {
								removedItem = result.removedItem;
							}
							return { ...item, items: result.items };
						}
						return item;
					});

				return { items: newItems, removedItem };
			};

			const result = findAndRemoveItem(prev.items);
			if (result.removedItem) {
				return { ...prev, items: [result.removedItem, ...result.items] };
			}

			return prev;
		});
	}, []);

	const moveToBottom = useCallback((id: string) => {
		setConfig((prev) => {
			// First, find and remove the item from anywhere in the structure
			const findAndRemoveItem = (
				items: WorkoutItem[],
			): { items: WorkoutItem[]; removedItem: WorkoutItem | null } => {
				let removedItem: WorkoutItem | null = null;

				const newItems = items
					.filter((item) => {
						if (item.id === id) {
							removedItem = item;
							return false;
						}
						return true;
					})
					.map((item) => {
						if (isLoop(item)) {
							const result = findAndRemoveItem(item.items);
							if (result.removedItem && !removedItem) {
								removedItem = result.removedItem;
							}
							return { ...item, items: result.items };
						}
						return item;
					});

				return { items: newItems, removedItem };
			};

			const result = findAndRemoveItem(prev.items);
			if (result.removedItem) {
				return { ...prev, items: [...result.items, result.removedItem] };
			}

			return prev;
		});
	}, []);

	const moveUp = useCallback((id: string) => {
		setConfig((prev) => {
			const moveItemUp = (items: WorkoutItem[]): WorkoutItem[] => {
				const itemIndex = items.findIndex((item) => item.id === id);
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
						return { ...item, items: moveItemUp(item.items) };
					}
					return item;
				});
			};

			return { ...prev, items: moveItemUp(prev.items) };
		});
	}, []);

	const moveDown = useCallback((id: string) => {
		setConfig((prev) => {
			const moveItemDown = (items: WorkoutItem[]): WorkoutItem[] => {
				const itemIndex = items.findIndex((item) => item.id === id);
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
						return { ...item, items: moveItemDown(item.items) };
					}
					return item;
				});
			};

			return { ...prev, items: moveItemDown(prev.items) };
		});
	}, []);

	// Enhanced drag handlers with nested support
	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	}, []);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			/* ---------------------------------------------------------------------
			 *                           HANDLE DRAG END
			 *
			 *  This callback orchestrates **all** state transitions that happen when
			 *  the user releases a dragged item.  The high-level flow is:
			 *
			 *    1. House-keeping – reset `activeId` & exit early when the drop target
			 *       is invalid.
			 *    2. Collect meta-data (ids, locations, actual objects) required by the
			 *       various guard-clauses and insertion strategies.
			 *    3. Guard-clauses – cancel the operation whenever a business rule is
			 *       violated (e.g. loops cannot be nested, intervals must live inside
			 *       a loop, an item cannot be dropped on itself, etc.).
			 *    4. Immutable remove → insert – depending on where the item was dropped
			 *       we remove it from the old position and re-insert it into the new one
			 *       using helper utilities. Each scenario (drop-zone, header, before/
			 *       after, root reorder, etc.) has its own dedicated block so the intent
			 *       is crystal clear.
			 *
			 *  All helper utilities (`findItemLocation`, `findAndRemoveItem`, …) are
			 *  defined inline so they can freely access `config.items` while still
			 *  benefiting from `useCallback` memoisation.
			 * ------------------------------------------------------------------- */
			const { active, over } = event;
			setActiveId(null);

			// Bail out when the user lets go outside a valid drop-zone
			if (!over) return;

			const activeIdStr = active.id as string;
			const overIdStr = over.id as string;

			// Find which loop contains an item (if any)
			const findItemLocation = (
				items: WorkoutItem[],
				targetId: string,
				parentLoopId?: string,
			): { loopId?: string; index: number } | null => {
				// Recursively walk the tree and return the index & parent loop (if any)
				// for the requested `targetId`. This information is reused multiple times
				// later when deciding where to put the dragged item.
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
			};

			// Check item locations upfront
			const activeLocation = findItemLocation(config.items, activeIdStr);
			const overLocation = findItemLocation(config.items, overIdStr);

			// Root-level constraints – fetch the actual objects once
			const activeItemObj = findItemById(config.items, activeIdStr);
			const overItemObj = findItemById(config.items, overIdStr);

			// ------------------------------------------------------------------
			// GUARD 1 – Allow loops to be nested inside other loops
			//           (Validation removed to enable full nesting capability)
			// ------------------------------------------------------------------
			// Note: Loop nesting is now fully supported

			// ------------------------------------------------------------------
			// GUARD 2 – Allow intervals at any level for full flexibility
			//           (Constraint removed to enable flexible timer structures)
			// ------------------------------------------------------------------
			// Note: Intervals can now be placed anywhere - at root level or inside loops

			// Find and remove the dragged item from anywhere in the structure
			const findAndRemoveItem = (
				items: WorkoutItem[],
			): { items: WorkoutItem[]; removedItem: WorkoutItem | null } => {
				let removedItem: WorkoutItem | null = null;

				const newItems = items
					.filter((item) => {
						if (item.id === activeIdStr) {
							removedItem = item;
							return false;
						}
						return true;
					})
					.map((item) => {
						if (isLoop(item)) {
							const result = findAndRemoveItem(item.items);
							if (result.removedItem && !removedItem) {
								removedItem = result.removedItem;
							}
							return { ...item, items: result.items };
						}
						return item;
					});

				return { items: newItems, removedItem };
			};

			// ============================= SCENARIOS ============================
			// From this point onward every if-block handles **one** concrete drop
			// scenario.  Each block performs the exact same two steps:
			//   1) `findAndRemoveItem` – extract the dragged item immutably.
			//   2) Produce the next state by inserting the item at the new position.
			// The function returns immediately after a successful state update so that
			// only one scenario can ever run per invocation.
			// ====================================================================
			// Handle dropping into a loop (drop zones) - ONLY for empty loop areas (not before/after indicators)
			// CASE A – Dropped *inside* an existing loop (empty interior area)
			if (
				(overIdStr.startsWith("drop-") &&
					!overIdStr.startsWith("drop-before-") &&
					!overIdStr.startsWith("drop-after-")) ||
				overIdStr.startsWith("empty-")
			) {
				const targetLoopId = overIdStr
					.replace("drop-", "")
					.replace("empty-", "");

				// 🛑 Guard: Prevent an item from being dropped into itself
				if (targetLoopId === activeIdStr) {
					return; // Exit early – no changes needed
				}

				setConfig((prev) => {
					const result = findAndRemoveItem(prev.items);
					if (result.removedItem && targetLoopId !== activeIdStr) {
						return {
							...prev,
							items: addItemToLoop(
								result.items,
								targetLoopId,
								result.removedItem,
							),
						};
					}
					return prev;
				});
				return;
			}

			// Handle dropping directly onto a loop HEADER – insert as FIRST item of that loop
			// CASE B – Dropped on the *header* of a loop, meaning we prepend the item.
			if (overItemObj && isLoop(overItemObj)) {
				// 🛑 Guard: Don't allow a loop to be inserted into itself
				if (overItemObj.id === activeIdStr) {
					return; // Exit early – no changes needed
				}

				setConfig((prev) => {
					const result = findAndRemoveItem(prev.items);
					if (result.removedItem && overIdStr !== activeIdStr) {
						const insertAtStart = (items: WorkoutItem[]): WorkoutItem[] => {
							return items.map((itm) => {
								if (isLoop(itm) && itm.id === overItemObj.id) {
									return {
										...itm,
										items: [result.removedItem!, ...itm.items],
									};
								}
								if (isLoop(itm)) {
									return { ...itm, items: insertAtStart(itm.items) };
								}
								return itm;
							});
						};

						return {
							...prev,
							items: insertAtStart(result.items),
						};
					}
					return prev;
				});
				return;
			}

			// Handle drop-before and drop-after zones specifically
			// CASE C – Dropped on virtual before/after drop-zones that live between
			//          siblings. The target location may be inside a loop **or** at root.
			if (
				overIdStr.startsWith("drop-before-") ||
				overIdStr.startsWith("drop-after-")
			) {
				const targetItemId = overIdStr
					.replace("drop-before-", "")
					.replace("drop-after-", "");

				// Don't allow dropping an item into its own drop zone
				if (targetItemId === activeIdStr) {
					return;
				}

				setConfig((prev) => {
					const result = findAndRemoveItem(prev.items);
					if (result.removedItem) {
						// Find the target item and its parent loop
						const findTargetAndParent = (
							items: WorkoutItem[],
							targetId: string,
							parentLoopId?: string,
						): {
							targetItem: WorkoutItem | null;
							parentLoopId?: string;
							index: number;
						} | null => {
							for (let i = 0; i < items.length; i++) {
								const item = items[i];
								if (item.id === targetId) {
									return { targetItem: item, parentLoopId, index: i };
								}
								if (isLoop(item)) {
									const found = findTargetAndParent(
										item.items,
										targetId,
										item.id,
									);
									if (found) return found;
								}
							}
							return null;
						};

						const targetInfo = findTargetAndParent(result.items, targetItemId);

						if (targetInfo && targetInfo.parentLoopId) {
							// Insert into the parent loop at the correct position
							const insertIntoLoopAtPosition = (
								items: WorkoutItem[],
							): WorkoutItem[] => {
								return items.map((item) => {
									if (isLoop(item) && item.id === targetInfo.parentLoopId) {
										const newItems = [...item.items];
										const targetIndex = newItems.findIndex(
											(subItem) => subItem.id === targetItemId,
										);

										if (targetIndex !== -1) {
											const insertIndex = overIdStr.startsWith("drop-before-")
												? targetIndex
												: targetIndex + 1;
											newItems.splice(insertIndex, 0, result.removedItem!);
										} else {
											// Fallback: append to end
											newItems.push(result.removedItem!);
										}

										return { ...item, items: newItems };
									} else if (isLoop(item)) {
										return {
											...item,
											items: insertIntoLoopAtPosition(item.items),
										};
									}
									return item;
								});
							};

							return {
								...prev,
								items: insertIntoLoopAtPosition(result.items),
							};
						} else if (targetInfo) {
							// Insert at root level
							const newItems = [...result.items];
							const insertIndex = overIdStr.startsWith("drop-before-")
								? targetInfo.index
								: targetInfo.index + 1;
							newItems.splice(insertIndex, 0, result.removedItem!);
							return { ...prev, items: newItems };
						}
					}
					return prev;
				});
				return;
			}

			// Handle dropping onto main container area (move out of loop to end)
			// CASE D – Dropped on the whitespace below all root items.  We treat this
			//          as appending the item to the very end at root level.
			if (overIdStr === "main-container") {
				setConfig((prev) => {
					const result = findAndRemoveItem(prev.items);
					if (result.removedItem) {
						return {
							...prev,
							items: [...result.items, result.removedItem],
						};
					}
					return prev;
				});
				return;
			}

			// Handle dropping an item directly onto another item (insert after the target)
			// CASE E – Dropped directly onto an item (not on a drop-zone).  We insert
			//          the dragged element **after** the hovered element.
			if (overLocation && activeIdStr !== overIdStr) {
				setConfig((prev) => {
					const result = findAndRemoveItem(prev.items);
					if (result.removedItem) {
						// If the target is inside a loop, insert it into that loop after the target
						if (overLocation.loopId) {
							const insertIntoLoopAfterTarget = (
								items: WorkoutItem[],
							): WorkoutItem[] => {
								return items.map((item) => {
									if (isLoop(item) && item.id === overLocation.loopId) {
										const newItems = [...item.items];
										const targetIndex = newItems.findIndex(
											(subItem) => subItem.id === overIdStr,
										);

										if (targetIndex !== -1) {
											// Insert after the target item
											newItems.splice(targetIndex + 1, 0, result.removedItem!);
										} else {
											// Fallback: append to end
											newItems.push(result.removedItem!);
										}

										return { ...item, items: newItems };
									} else if (isLoop(item)) {
										return {
											...item,
											items: insertIntoLoopAfterTarget(item.items),
										};
									}
									return item;
								});
							};

							return {
								...prev,
								items: insertIntoLoopAfterTarget(result.items),
							};
						} else {
							// If the target is at root level, insert after it
							const newItems = [...result.items];
							newItems.splice(overLocation.index + 1, 0, result.removedItem!);
							return { ...prev, items: newItems };
						}
					}
					return prev;
				});
				return;
			}

			// Handle reordering within the same loop
			// CASE F – Simple re-ordering inside the **same** parent loop.
			if (
				activeLocation &&
				overLocation &&
				activeLocation.loopId &&
				activeLocation.loopId === overLocation.loopId &&
				activeIdStr !== overIdStr
			) {
				setConfig((prev) => {
					const reorderInLoop = (items: WorkoutItem[]): WorkoutItem[] => {
						return items.map((item) => {
							if (isLoop(item) && item.id === activeLocation.loopId) {
								const activeIndex = item.items.findIndex(
									(subItem) => subItem.id === activeIdStr,
								);
								const overIndex = item.items.findIndex(
									(subItem) => subItem.id === overIdStr,
								);

								if (activeIndex !== -1 && overIndex !== -1) {
									return {
										...item,
										items: arrayMove(item.items, activeIndex, overIndex),
									};
								}
							} else if (isLoop(item)) {
								return {
									...item,
									items: reorderInLoop(item.items),
								};
							}
							return item;
						});
					};

					return { ...prev, items: reorderInLoop(prev.items) };
				});
				return;
			}

			// Handle moving from inside a loop to outside at specific position
			// CASE G – Moving an item from *inside* a loop to a specific position at
			//          the root level (while hovering over another root item).
			if (
				activeLocation?.loopId &&
				overLocation &&
				!overLocation.loopId &&
				activeIdStr !== overIdStr
			) {
				setConfig((prev) => {
					const result = findAndRemoveItem(prev.items);
					if (result.removedItem) {
						const newItems = [...result.items];
						newItems.splice(overLocation.index, 0, result.removedItem);
						return { ...prev, items: newItems };
					}
					return prev;
				});
				return;
			}

			// Handle reordering at root level
			// CASE H – Plain root-level reorder (dragging a root item over another).
			if (
				activeIdStr !== overIdStr &&
				!activeLocation?.loopId &&
				!overLocation?.loopId &&
				overLocation
			) {
				setConfig((prev) => {
					const result = findAndRemoveItem(prev.items);
					if (result.removedItem && overLocation) {
						const newItems = [...result.items];
						newItems.splice(overLocation.index, 0, result.removedItem);
						return { ...prev, items: newItems };
					}
					return prev;
				});
			}
		},
		[config.items],
	);

	// Initialize timer - only when state changes to idle
	useEffect(() => {
		if (state === "idle") {
			if (flattenedIntervals.length > 0) {
				setTimeLeft(flattenedIntervals[0].duration);
				setCurrentType(mapIntervalTypeToTimerType(flattenedIntervals[0].type));
				setCurrentItemIndex(0);
			}
			setCurrentSet(1);
		}
	}, [state, flattenedIntervals, setCurrentSet]);

	// Separate effect for config changes
	useEffect(() => {
		if (state === "idle" && flattenedIntervals.length > 0) {
			setTimeLeft(flattenedIntervals[0].duration);
			setCurrentType(mapIntervalTypeToTimerType(flattenedIntervals[0].type));
			setCurrentItemIndex(0);
		}
	}, [flattenedIntervals, state]);

	const handleTimerComplete = useCallback(() => {
		const nextIndex = currentItemIndex + 1;

		if (nextIndex < flattenedIntervals.length) {
			// Play sound for next interval only if it has a custom sound
			const nextIntervalPreview = flattenedIntervals[nextIndex];
			if (nextIntervalPreview.sound) {
				playSound(nextIntervalPreview.sound);
			}
			const nextInterval = flattenedIntervals[nextIndex];
			setCurrentItemIndex(nextIndex);
			setCurrentType(mapIntervalTypeToTimerType(nextInterval.type));
			setTimeLeft(nextInterval.duration);

			const intervalName = nextInterval.loopInfo
				? `${nextInterval.loopInfo.iteration} - ${nextInterval.name}`
				: nextInterval.name;

			timerToasts.nextInterval(intervalName);
		} else {
			stopAllSounds();
			playSound(config.defaultAlarm);
			setCompleted("🎉 Advanced Workout Complete! Great job!");
			// Call completion callback if provided
			onComplete?.(timerName || "Timer");
		}
	}, [
		currentItemIndex,
		flattenedIntervals,
		setCompleted,
		config.defaultAlarm,
		stopAllSounds,
		onComplete,
		timerName,
	]);

	// Timer countdown logic
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (state === "running" && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((prev) => prev - 1);
			}, 1000);
		} else if (state === "running" && timeLeft === 0) {
			handleTimerComplete();
		}

		return () => clearInterval(interval);
	}, [state, timeLeft, handleTimerComplete]);

	const resetState = useCallback(() => {
		setCurrentSet(1);
		setCurrentItemIndex(0);
	}, [setCurrentSet]);

	const startTimer = useCallback(
		() => baseStartTimer("Advanced Timer started!"),
		[baseStartTimer],
	);
	const resetTimer = useCallback(
		() => baseResetTimer(resetState),
		[baseResetTimer, resetState],
	);
	const stopTimer = useCallback(
		() => baseStopTimer(resetState),
		[baseStopTimer, resetState],
	);
	const handleHoldStart = useCallback(
		() =>
			baseHoldStart(() => {
				stopTimer();
				onExit?.();
			}),
		[baseHoldStart, stopTimer, onExit],
	);

	// Memoized calculations
	const totalSessionTime = useMemo(() => {
		if (flattenedIntervals.length === 0) return 0;
		return flattenedIntervals.reduce(
			(sum, interval) => sum + interval.duration,
			0,
		);
	}, [flattenedIntervals]);

	const overallProgress = useMemo(() => {
		if (state === "idle" || state === "completed") return 0;

		const totalIntervals = flattenedIntervals.length;
		if (totalIntervals === 0) return 0;

		let currentIntervalProgress = 0;
		if (
			flattenedIntervals.length > 0 &&
			currentItemIndex < flattenedIntervals.length
		) {
			const currentInterval = flattenedIntervals[currentItemIndex];
			currentIntervalProgress =
				getProgress(currentInterval.duration, timeLeft) / 100;
		}

		return Math.min(
			100,
			((currentItemIndex + currentIntervalProgress) / totalIntervals) * 100,
		);
	}, [state, flattenedIntervals, currentItemIndex, timeLeft]);

	const totalTimeRemaining = useMemo(() => {
		if (state === "idle" || state === "completed") return 0;

		let remaining = timeLeft;

		// Add remaining intervals
		for (let i = currentItemIndex + 1; i < flattenedIntervals.length; i++) {
			remaining += flattenedIntervals[i].duration;
		}

		return remaining;
	}, [state, timeLeft, currentItemIndex, flattenedIntervals, stopAllSounds]);

	// Current interval info
	const currentInterval = useMemo(() => {
		if (
			flattenedIntervals.length === 0 ||
			currentItemIndex >= flattenedIntervals.length
		) {
			return null;
		}
		return flattenedIntervals[currentItemIndex];
	}, [flattenedIntervals, currentItemIndex]);

	const currentIntervalColor = useMemo(() => {
		if (!currentInterval) return undefined;
		return currentInterval.color || config.colors[currentInterval.type];
	}, [currentInterval, config.colors]);

	// Compute nextInterval for preview
	const nextInterval =
		flattenedIntervals.length > 0 &&
		currentItemIndex + 1 < flattenedIntervals.length
			? (() => {
					const next = flattenedIntervals[currentItemIndex + 1];
					return {
						name: next.name,
						type: mapIntervalTypeToTimerType(next.type),
						duration: next.duration,
						color: next.color || config.colors[next.type],
					};
				})()
			: undefined;

	// Calculate current set and total sets for display
	const { currentLoopSet, totalLoopSets } = useMemo(() => {
		if (!currentInterval || !currentInterval.loopInfo) {
			// No loop info means no loops, so show 1/1 or hide sets
			return { currentLoopSet: 1, totalLoopSets: 1 };
		}

		// Find the root-level loop info (outermost loop)
		let rootLoopInfo = currentInterval.loopInfo;
		while (rootLoopInfo.parentLoop) {
			rootLoopInfo = rootLoopInfo.parentLoop;
		}

		// Find the corresponding loop item to get total iterations
		const findLoopItem = (
			items: WorkoutItem[],
			targetInfo: any,
		): LoopGroup | null => {
			for (const item of items) {
				if (isLoop(item)) {
					// This is a bit tricky - we need to match the loop that generated this loopInfo
					// For now, let's use the first loop we find at the current nesting level
					if (!targetInfo.parentLoop) {
						// This is a root-level loop
						return item;
					}
				}
				if (isLoop(item)) {
					const found = findLoopItem(item.items, targetInfo);
					if (found) return found;
				}
			}
			return null;
		};

		const loopItem = findLoopItem(config.items, rootLoopInfo);

		return {
			currentLoopSet: rootLoopInfo.iteration,
			totalLoopSets: loopItem?.loops || 1,
		};
	}, [currentInterval, config.items]);

	// Item management functions with useCallback for performance
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

	const updateItem = useCallback((id: string, field: string, value: any) => {
		const updateRecursive = (items: WorkoutItem[]): WorkoutItem[] => {
			return items.map((item) => {
				if (item.id === id) {
					return {
						...item,
						[field]: field === "duration" ? Math.max(1, Number(value)) : value,
					};
				}
				if (isLoop(item)) {
					return {
						...item,
						items: updateRecursive(item.items),
					};
				}
				return item;
			});
		};

		setConfig((prev) => ({
			...prev,
			items: updateRecursive(prev.items),
		}));
	}, []);

	const toggleLoopCollapse = useCallback((id: string) => {
		const toggleRecursive = (items: WorkoutItem[]): WorkoutItem[] => {
			return items.map((item) => {
				if (item.id === id && isLoop(item)) {
					return { ...item, collapsed: !item.collapsed };
				}
				if (isLoop(item)) {
					return { ...item, items: toggleRecursive(item.items) };
				}
				return item;
			});
		};

		setConfig((prev) => ({
			...prev,
			items: toggleRecursive(prev.items),
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
								name: `${item.name} (Copy)`,
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

	// Current interval info
	const getCurrentIntervalName = useCallback(() => {
		if (!currentInterval) return "PREPARE";

		return currentInterval.name;
	}, [currentInterval]);

	const getTimerProgress = useCallback(() => {
		if (!currentInterval) return 0;
		return getProgress(currentInterval.duration, timeLeft);
	}, [currentInterval, timeLeft]);

	// Navigation functions
	const fastForward = useCallback(() => {
		if (state === "idle" || state === "completed") return;

		stopAllSounds();

		if (timeLeft > 0) {
			setTimeLeft(0);
			timerToasts.fastForward("Skipped to end of interval");
		} else if (currentItemIndex < flattenedIntervals.length - 1) {
			const nextIndex = currentItemIndex + 1;
			setCurrentItemIndex(nextIndex);
			const nextInterval = flattenedIntervals[nextIndex];
			setCurrentType(mapIntervalTypeToTimerType(nextInterval.type));
			setTimeLeft(nextInterval.duration);
			timerToasts.fastForward(`Skipped to ${nextInterval.name}`);
		}
	}, [state, timeLeft, currentItemIndex, flattenedIntervals]);

	const fastBackward = useCallback(() => {
		if (state === "idle" || state === "completed") return;

		if (currentInterval && timeLeft < currentInterval.duration) {
			setTimeLeft(currentInterval.duration);
			timerToasts.fastBackward("Jumped to start of interval");
		} else if (currentItemIndex > 0) {
			const prevIndex = currentItemIndex - 1;
			setCurrentItemIndex(prevIndex);
			const prevInterval = flattenedIntervals[prevIndex];
			setCurrentType(mapIntervalTypeToTimerType(prevInterval.type));
			setTimeLeft(prevInterval.duration);
			timerToasts.fastBackward(`Jumped back to ${prevInterval.name}`);
		}
	}, [state, currentInterval, timeLeft, currentItemIndex, flattenedIntervals]);

	// Color management
	const updateColor = useCallback(
		(type: keyof ColorSettings, color: string) => {
			setConfig((prev) => ({
				...prev,
				colors: { ...prev.colors, [type]: color },
			}));
		},
		[],
	);

	const resetColors = useCallback(() => {
		setConfig((prev) => ({
			...prev,
			colors: ADVANCED_TIMER_DEFAULT_COLORS,
		}));
	}, []);

	// Check if we should show minimalistic view
	const isMinimalisticView =
		!editMode && (state === "running" || state === "paused" || autoStart);

	// Check if we should show completion screen
	const isCompletionView = !editMode && state === "completed";

	// Initialize timer when idle
	useEffect(() => {
		if (state === "idle" && flattenedIntervals.length > 0) {
			const firstInterval = flattenedIntervals[0];
			setTimeLeft(firstInterval.duration);
			setCurrentType(mapIntervalTypeToTimerType(firstInterval.type));
			setCurrentItemIndex(0);
			setCurrentSet(1);
		}
	}, [state, flattenedIntervals, setCurrentSet]);

	// DnD Monitor Component - must be inside DndContext
	const DndMonitor = () => {
		useDndMonitor({
			onDragStart(event) {
				/* onDragStart */
			},
			// onDragMove(event) {
			// 	console.log("onDragMove", event);
			// },
			onDragOver(event) {
				/* onDragOver */
			},
			onDragEnd(event) {
				/* onDragEnd */
			},
			// onDragCancel(event) {
			// 	console.log("onDragCancel", event);
			// },
		});
		return null;
	};

	// ======= Countdown beep logic (3-2-1) =======
	const playedSecondsRef = useRef<Set<number>>(new Set());

	// Clear played seconds when interval changes
	useEffect(() => {
		playedSecondsRef.current.clear();
	}, [currentInterval]);

	useEffect(() => {
		// Play short countdown beeps only while actively running
		if (state !== "running") return;
		if (!currentInterval) return;

		const soundKey = (currentInterval.sound || config.defaultAlarm) as string;
		// Handle any category countdown based on variant pattern
		const [category, variant] = soundKey.split("-") as [
			string,
			string | undefined,
		];

		let beepCount = 1;
		if (variant === "2x") beepCount = 2;
		else if (variant === "3x") beepCount = 3;

		if (timeLeft >= 1 && timeLeft <= 3 && timeLeft <= beepCount) {
			if (!playedSecondsRef.current.has(timeLeft)) {
				playedSecondsRef.current.add(timeLeft);
				const shortKey = `${category}-short`;
				playSound(shortKey);
			}
		}
	}, [state, timeLeft, currentInterval, config.defaultAlarm]);

	// ======= Speak interval names while running =======
	useEffect(() => {
		if (!config.speakNames) return;
		if (state !== "running") return;
		if (
			flattenedIntervals.length === 0 ||
			currentItemIndex >= flattenedIntervals.length
		)
			return;

		const interval = flattenedIntervals[currentItemIndex];
		const name = interval.name;
		speakText(name);
	}, [state, currentItemIndex, flattenedIntervals, config.speakNames]);

	// Replace handleSave with immediate save logic
	const handleSave = () => {
		if (!timerName.trim()) {
			toast.error("Please provide a name");
			return;
		}

		// Validate timer structure to prevent nested loops
		// if (!validateTimerStructure(config.items)) {
		// 	toast.error(
		// 		"Invalid timer structure: Loops cannot be nested inside other loops",
		// 		{
		// 			id: "structure-validation",
		// 		},
		// 	);
		// 	return;
		// }

		// If editing an existing timer
		if (loadedTimer) {
			const duplicate = existingTimers?.find(
				(t: any) => t.name === timerName.trim() && t.id !== loadedTimer.id,
			);
			if (duplicate) {
				toast.error("Timer name already exists");
				return;
			}

			overwriteTimer(
				{
					id: loadedTimer.id,
					data: { name: timerName.trim(), data: config },
				},
				{
					onSuccess: (updated) => {
						if (onSaved) onSaved(updated);
						onSaveComplete?.();
					},
				},
			);
			return;
		}

		// Creating a brand-new timer
		const duplicate = existingTimers?.find(
			(t: any) => t.name === timerName.trim(),
		);
		if (duplicate) {
			toast.error("Timer name already exists");
			return;
		}

		saveTimer(
			{ name: timerName.trim(), data: config },
			{
				onSuccess: () => {
					if (onSaved) {
						onSaved(config);
					}
					onSaveComplete?.();
				},
			},
		);
	};

	// Auto-start timer when autoStart prop is true and timer is loaded
	useEffect(() => {
		if (
			autoStart &&
			loadedTimer &&
			state === "idle" &&
			flattenedIntervals.length > 0
		) {
			// Small delay to ensure everything is initialized
			const timer = setTimeout(() => {
				baseStartTimer("Timer started!");
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [autoStart, loadedTimer, state, flattenedIntervals, baseStartTimer]);

	// Notify parent when minimalistic view changes
	useEffect(() => {
		onMinimalisticViewChange?.(isMinimalisticView);
	}, [isMinimalisticView, onMinimalisticViewChange]);

	// --- Dirty state tracking for unsaved changes ---
	const initialConfigRef = useRef<AdvancedConfig | null>(null);
	const initialNameRef = useRef<string>("");
	const initialSourceRef = useRef<string>("__uninitialized__");

	// Set initial config and name on mount or when loadedTimer changes
	useEffect(() => {
		const sourceKey = loadedTimer?.id ? `timer:${loadedTimer.id}` : "new";

		// If we switched timers (or switched to "new"), reset the captured baseline.
		if (initialSourceRef.current !== sourceKey) {
			initialSourceRef.current = sourceKey;
			initialConfigRef.current = null;
			initialNameRef.current = "";
		}

		if (loadedTimer?.data) {
			initialConfigRef.current = loadedTimer.data as AdvancedConfig;
			initialNameRef.current = loadedTimer.name || "";
			return;
		}

		// Only capture the "new timer" baseline once; otherwise dirty tracking breaks.
		if (initialConfigRef.current === null) {
			initialConfigRef.current = config;
			initialNameRef.current = timerName;
		}
	}, [loadedTimer, config, timerName]);

	// Helper to compare config and name for dirty state
	const isDirty = useMemo(() => {
		const initialConfig = initialConfigRef.current;
		const initialName = initialNameRef.current;
		if (!initialConfig) return false;
		const configChanged =
			JSON.stringify(config) !== JSON.stringify(initialConfig);
		const nameChanged = timerName !== initialName;
		return configChanged || nameChanged;
	}, [config, timerName]);

	// --- Confirmation dialog state ---
	const [showConfirmExit, setShowConfirmExit] = useState(false);
	const [pendingExit, setPendingExit] = useState(false);

	// Intercept exit: if dirty, show dialog, else call onExit
	const handleBack = useCallback(() => {
		if (isDirty) {
			setShowConfirmExit(true);
		} else {
			onExit?.();
		}
	}, [isDirty, onExit]);

	// Save and exit logic
	const handleSaveAndExit = useCallback(() => {
		if (!timerName.trim()) {
			toast.error("Please provide a name", { id: "save-exit-no-name" });
			return;
		}
		setPendingExit(true);
		const onSuccess = () => {
			setPendingExit(false);
			setShowConfirmExit(false);
			onExit?.();
		};
		// If editing an existing timer
		if (loadedTimer) {
			const duplicate = existingTimers?.find(
				(t: any) => t.name === timerName.trim() && t.id !== loadedTimer.id,
			);
			if (duplicate) {
				toast.error("Timer name already exists", { id: "save-exit-duplicate" });
				setPendingExit(false);
				return;
			}
			overwriteTimer(
				{
					id: loadedTimer.id,
					data: { name: timerName.trim(), data: config },
				},
				{ onSuccess },
			);
			return;
		}
		// Creating a brand-new timer
		const duplicate = existingTimers?.find(
			(t: any) => t.name === timerName.trim(),
		);
		if (duplicate) {
			toast.error("Timer name already exists", { id: "save-exit-duplicate" });
			setPendingExit(false);
			return;
		}
		saveTimer({ name: timerName.trim(), data: config }, { onSuccess });
	}, [
		timerName,
		config,
		loadedTimer,
		existingTimers,
		overwriteTimer,
		saveTimer,
		onExit,
	]);

	return (
		<div className="relative">
			{/* Confirmation dialog for unsaved changes */}
			<Dialog open={showConfirmExit} onOpenChange={setShowConfirmExit}>
				<DialogContent className="max-w-sm">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-lg font-semibold">Unsaved changes</h2>
					</div>
					<div className="py-2 text-sm text-muted-foreground">
						You have unsaved changes. What would you like to do?
					</div>
					<div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
						<Button
							variant="outline"
							onClick={() => setShowConfirmExit(false)}
							className="flex-1"
						>
							<X size={16} className="mr-2" /> Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								setShowConfirmExit(false);
								onExit?.();
							}}
							className="flex-1"
						>
							<Undo size={16} className="mr-2" /> Back without saving
						</Button>
						<Button
							disabled={pendingExit}
							onClick={handleSaveAndExit}
							className="flex-1"
						>
							<SaveIcon size={16} className="mr-2" />
							{pendingExit ? "Saving..." : "Save and back"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
			{/* Completion screen when timer is finished */}
			{isCompletionView && (
				<div className="fixed inset-0 flex items-center justify-center bg-background">
					<TimerCompletionScreen
						onBack={() => onExit?.()}
						onAgain={() => {
							resetTimer();
							startTimer();
						}}
						timerName={timerName}
					/>
				</div>
			)}

			{/* Minimalistic view when timer is running */}
			{isMinimalisticView && !isCompletionView && (
				<>
					<MinimalisticContainer>
						<RunningTimerView
							timeLeft={timeLeft}
							state={state}
							currentSet={currentLoopSet}
							totalSets={totalLoopSets}
							intervalType={getIntervalTypeForDisplay(currentType)}
							intervalColor={currentIntervalColor}
							currentIntervalName={getCurrentIntervalName()}
							progress={getTimerProgress()}
							overallProgress={overallProgress}
							totalTimeRemaining={totalTimeRemaining}
							currentStep={currentItemIndex + 1}
							totalSteps={flattenedIntervals.length}
							isHolding={isHolding}
							holdProgress={holdProgress}
							onFastBackward={fastBackward}
							onFastForward={fastForward}
							onHoldStart={handleHoldStart}
							onHoldEnd={handleHoldEnd}
							onPlay={startTimer}
							onPause={pauseTimer}
							nextInterval={nextInterval}
						/>
					</MinimalisticContainer>
				</>
			)}

			{!isMinimalisticView && !isCompletionView && (
				<>
					{/* Mobile: thumb-reachable back button */}
					<Button
						variant="outline"
						size="icon"
						className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-background/80 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
						onClick={handleBack}
					>
						<ArrowLeft size={20} />
						<span className="sr-only">Back</span>
					</Button>

					{/* Mobile: thumb-reachable save button (floating like back) */}
					<Button
						onClick={handleSave}
						variant="brand"
						size="icon"
						className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg md:hidden"
						disabled={isSavingOrUpdating}
					>
						<SaveIcon size={20} />
						<span className="sr-only">
							{isSavingOrUpdating ? "Saving..." : "Save"}
						</span>
					</Button>

					<Card>
						{/* Desktop: sticky top bar with Back & Save */}
						<div className="sticky top-0 z-10 hidden items-center justify-between gap-2 border-b bg-background/80 px-4 py-2 backdrop-blur md:flex">
							<Button
								variant="ghost"
								size="icon"
								onClick={handleBack}
								className="hidden md:inline-flex"
							>
								<ArrowLeft size={16} />
								<span className="sr-only">Back</span>
							</Button>

							<Button
								onClick={handleSave}
								variant="default"
								size="sm"
								className="gap-2"
								disabled={isSavingOrUpdating}
							>
								{isSavingOrUpdating ? (
									"Saving..."
								) : (
									<>
										<SaveIcon size={16} /> Save
									</>
								)}
							</Button>
						</div>

						<CardContent className="space-y-6 p-1 pb-24 pt-2 md:p-6">
							{/* Timer Name, Stats, and Actions - Responsive Row/Column */}
							<div className="flex flex-col gap-4">
								{/* Row 1: Name + Stats (side by side on md+) */}
								<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-4">
									<div className="w-full md:w-auto">
										<div className="relative">
											<Input
												id="timer-name"
												className="peer w-full"
												value={timerName}
												onChange={(e) => handleTimerNameChange(e.target.value)}
												placeholder=" "
												maxLength={TIMER_NAME_MAX_LENGTH}
												aria-describedby="timer-name-hint"
											/>
											<Label
												htmlFor="timer-name"
												className="pointer-events-none absolute left-3 top-2 z-10 origin-left -translate-y-4 scale-75 bg-background px-1 text-xs text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-xs peer-focus:text-foreground"
											>
												Timer name
											</Label>
										</div>
										<p
											id="timer-name-hint"
											className="mt-1 px-1 text-right text-xs text-muted-foreground"
										>
											{timerName.length}/{TIMER_NAME_MAX_LENGTH}
										</p>
									</div>
									<div className="flex w-full flex-wrap items-center justify-center gap-4 md:w-auto md:justify-center">
										<StatCard
											label="Total Session Time"
											value={formatTime(totalSessionTime)}
										/>
										<StatCard
											label="Total Steps"
											value={flattenedIntervals.length.toString()}
											valueClassName="text-2xl font-bold"
										/>
									</div>
								</div>
								{/* Row 2: Buttons (50% width each on mobile, right-aligned on sm+) */}
								<div className="flex w-full flex-row gap-2 sm:justify-end">
									<Button
										onClick={() => setShowSettings(true)}
										variant="control"
										size="sm"
										className="w-1/2 gap-2 sm:w-auto"
									>
										<Settings size={16} />
										Settings
									</Button>
									<Button
										onClick={addLoop}
										variant="control"
										size="sm"
										className="w-1/2 gap-2 sm:w-auto"
									>
										<Repeat size={16} />
										Add Loop
									</Button>
								</div>
							</div>

							<div className="space-y-4">
								<DndContext
									sensors={sensors}
									collisionDetection={closestCenter}
									onDragStart={handleDragStart}
									onDragEnd={handleDragEnd}
								>
									<DndMonitor />
									<SortableContext
										items={config.items.map((item) => item.id)}
										strategy={verticalListSortingStrategy}
									>
										<DroppableZone
											id="main-container"
											className=""
											style={{ touchAction: "manipulation" }}
										>
											<div data-dnd-sortable="true" className="space-y-4">
												{config.items.map((item, idx) => (
													<div key={item.id} className="relative">
														{/* Drop indicator before the first root item */}
														{activeId && idx === 0 && (
															<DroppableZone
																id={`drop-before-${item.id}`}
																className="-my-3 h-6 bg-transparent"
																style={{ minHeight: 24 }}
															>
																<span className="sr-only">before-drop</span>
															</DroppableZone>
														)}

														<SortableItem
															item={item}
															onUpdate={updateItem}
															onRemove={removeItem}
															onToggleCollapse={toggleLoopCollapse}
															onAddToLoop={addToLoop}
															onDuplicate={duplicateItem}
															onMoveToTop={moveToTop}
															onMoveToBottom={moveToBottom}
															onMoveUp={moveUp}
															onMoveDown={moveDown}
															activeId={activeId}
															colors={config.colors}
														/>

														{/* Drop indicator after each root item */}
														<DroppableZone
															id={`drop-after-${item.id}`}
															className="-my-3 h-6 bg-transparent"
															style={{ minHeight: 24 }}
														>
															<span className="sr-only">after-drop</span>
														</DroppableZone>
													</div>
												))}
											</div>
										</DroppableZone>
									</SortableContext>

									<DragOverlay>
										{activeId ? (
											<div className="rounded-lg border bg-card p-3 text-card-foreground shadow-lg">
												<div className="text-sm font-medium">
													{(() => {
														const item = findItemById(config.items, activeId);
														if (!item) return "Item";
														return isInterval(item) ? item.name : "Loop";
													})()}
												</div>
											</div>
										) : null}
									</DragOverlay>
								</DndContext>
							</div>

							{editMode ? null : (
								<TimerControls
									state={state}
									onStart={startTimer}
									onPause={pauseTimer}
									onReset={resetTimer}
									onStop={stopTimer}
									onFastBackward={fastBackward}
									onFastForward={fastForward}
									startLabel="Start Advanced Timer"
									resetLabel="Start New Advanced Workout"
									disabled={flattenedIntervals.length === 0}
								/>
							)}
						</CardContent>
					</Card>
				</>
			)}

			{/* Settings Dialog */}
			<Dialog open={showSettings} onOpenChange={setShowSettings}>
				<DialogContent title="Color Settings" className="max-w-lg">
					<DialogClose onClose={() => setShowSettings(false)} />

					<div className="space-y-6">
						<div className="space-y-4">
							<h3 className="text-base font-medium">Interval Colors</h3>

							<ColorPicker
								label="Prepare Intervals"
								value={config.colors.prepare}
								onChange={(color) => updateColor("prepare", color)}
							/>

							<ColorPicker
								label="Work Intervals"
								value={config.colors.work}
								onChange={(color) => updateColor("work", color)}
							/>

							<ColorPicker
								label="Rest Intervals"
								value={config.colors.rest}
								onChange={(color) => updateColor("rest", color)}
							/>
						</div>

						<div className="space-y-4">
							<h3 className="text-base font-medium">Loop Colors</h3>

							<ColorPicker
								label="Main Loops"
								value={config.colors.loop}
								onChange={(color) => updateColor("loop", color)}
							/>

							<ColorPicker
								label="Nested Loops"
								value={config.colors.nestedLoop}
								onChange={(color) => updateColor("nestedLoop", color)}
							/>
						</div>

						{/* Alarm settings */}
						<div className="space-y-4">
							<h3 className="text-base font-medium">Alarm Sound</h3>

							<div className="flex gap-2">
								<Select
									value={config.defaultAlarm}
									onValueChange={(value) => {
										setConfig((prev) => ({ ...prev, defaultAlarm: value }));
										playSound(value);
									}}
								>
									<SelectTrigger className="flex-1">
										<SelectValue placeholder="Select alarm" />
									</SelectTrigger>
									<SelectContent>
										{SOUND_OPTIONS.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Button
									variant="outline"
									size="icon"
									onClick={() => playSound(config.defaultAlarm)}
								>
									▶
								</Button>
							</div>
						</div>

						{/* Speak names toggle */}
						<div className="flex items-center gap-2">
							<Checkbox
								id="speak-names"
								checked={config.speakNames}
								onCheckedChange={(checked) =>
									setConfig((prev) => ({ ...prev, speakNames: !!checked }))
								}
							/>
							<Label htmlFor="speak-names" className="text-sm">
								Speak interval names
							</Label>
						</div>

						<div className="flex gap-2 pt-4">
							<Button
								onClick={resetColors}
								variant="outline"
								className="flex-1"
							>
								Reset to Defaults
							</Button>
							<Button onClick={() => setShowSettings(false)} className="flex-1">
								Done
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

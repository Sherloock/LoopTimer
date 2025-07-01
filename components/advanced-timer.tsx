"use client";

import { MinimalisticContainer } from "@/components/minimalistic-container";
import { MinimalisticTimerView } from "@/components/minimalistic-timer-view";
import { TimerControls } from "@/components/timer-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { StatCard } from "@/components/ui/stat-card";
import { useTimerState } from "@/hooks/use-timer-state";
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
	useDndMonitor,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	ChevronDown,
	ChevronRight,
	Copy,
	GripVertical,
	Plus,
	Repeat,
	Settings,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface IntervalStep {
	id: string;
	name: string;
	duration: number;
	type: "prepare" | "work" | "rest";
	color?: string;
	skipOnLastLoop?: boolean;
}

interface LoopGroup {
	id: string;
	name: string;
	loops: number;
	items: WorkoutItem[];
	collapsed?: boolean;
	color?: string;
}

type WorkoutItem = IntervalStep | LoopGroup;

interface ColorSettings {
	prepare: string;
	work: string;
	rest: string;
	loop: string;
	nestedLoop: string;
}

interface AdvancedConfig {
	items: WorkoutItem[];
	colors: ColorSettings;
}

// Helper functions
const isLoop = (item: WorkoutItem): item is LoopGroup => {
	return "loops" in item && "items" in item;
};

const isInterval = (item: WorkoutItem): item is IntervalStep => {
	return "duration" in item && "type" in item;
};

const getDefaultNameForType = (type: "prepare" | "work" | "rest"): string => {
	switch (type) {
		case "prepare":
			return "PREPARE";
		case "work":
			return "WORK";
		case "rest":
			return "REST";
		default:
			return "INTERVAL";
	}
};

// Simple Checkbox Component
function Checkbox({
	id,
	checked,
	onCheckedChange,
}: {
	id: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}) {
	return (
		<input
			id={id}
			type="checkbox"
			checked={checked}
			onChange={(e) => onCheckedChange(e.target.checked)}
			className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
		/>
	);
}

// Droppable Zone Component
function DroppableZone({
	id,
	children,
	className = "",
	isOver = false,
	style,
}: {
	id: string;
	children: React.ReactNode;
	className?: string;
	isOver?: boolean;
	style?: React.CSSProperties;
}) {
	const { setNodeRef, isOver: isDndOver } = useDroppable({ id });

	return (
		<div
			ref={setNodeRef}
			className={`${className} transition-all duration-200 ${
				isDndOver || isOver
					? "border-dashed border-blue-400 bg-blue-50 shadow-inner"
					: ""
			}`}
			style={style}
		>
			{children}
		</div>
	);
}

// Loop Settings Dialog Component
function LoopSettingsDialog({
	isOpen,
	onClose,
	item,
	onUpdate,
	onDuplicate,
	onDelete,
	onMoveToTop,
	onMoveToBottom,
	colors,
}: {
	isOpen: boolean;
	onClose: () => void;
	item: LoopGroup;
	onUpdate: (id: string, field: string, value: any) => void;
	onDuplicate: (id: string) => void;
	onDelete: (id: string) => void;
	onMoveToTop: (id: string) => void;
	onMoveToBottom: (id: string) => void;
	colors: ColorSettings;
}) {
	const itemColor = item.color || colors.loop;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent title={`${item.name} Settings`} className="max-w-md">
				<DialogClose onClose={onClose} />

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Loop Name</Label>
						<Input
							value={item.name}
							onChange={(e) => onUpdate(item.id, "name", e.target.value)}
							placeholder="Loop name"
						/>
					</div>

					<div className="space-y-2">
						<Label>Number of Loops</Label>
						<NumberInput
							value={item.loops}
							onChange={(value) => onUpdate(item.id, "loops", value)}
							min={1}
							step={1}
						/>
					</div>

					<ColorPicker
						label="Custom Color"
						value={itemColor}
						onChange={(color) => onUpdate(item.id, "color", color)}
					/>

					<div className="flex gap-2">
						<Button
							onClick={() => {
								onMoveToTop(item.id);
								onClose();
							}}
							variant="outline"
							className="flex-1 gap-2"
						>
							↑ Top
						</Button>
						<Button
							onClick={() => {
								onMoveToBottom(item.id);
								onClose();
							}}
							variant="outline"
							className="flex-1 gap-2"
						>
							↓ Bottom
						</Button>
					</div>

					<div className="flex gap-2 pt-4">
						<Button
							onClick={() => {
								onDuplicate(item.id);
								onClose();
							}}
							variant="outline"
							className="flex-1 gap-2"
						>
							<Copy size={16} />
							Duplicate
						</Button>
						<Button
							onClick={() => {
								onDelete(item.id);
								onClose();
							}}
							variant="destructive"
							className="flex-1 gap-2"
						>
							<Trash2 size={16} />
							Delete
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// Interval Settings Dialog Component
function IntervalSettingsDialog({
	isOpen,
	onClose,
	item,
	onUpdate,
	onDuplicate,
	onDelete,
	onMoveToTop,
	onMoveToBottom,
	colors,
}: {
	isOpen: boolean;
	onClose: () => void;
	item: IntervalStep;
	onUpdate: (id: string, field: string, value: any) => void;
	onDuplicate: (id: string) => void;
	onDelete: (id: string) => void;
	onMoveToTop: (id: string) => void;
	onMoveToBottom: (id: string) => void;
	colors: ColorSettings;
}) {
	const itemColor = item.color || colors[item.type];

	const getDefaultNameForType = (type: "prepare" | "work" | "rest"): string => {
		switch (type) {
			case "prepare":
				return "PREPARE";
			case "work":
				return "WORK";
			case "rest":
				return "REST";
			default:
				return "INTERVAL";
		}
	};

	const handleTypeChange = (newType: "prepare" | "work" | "rest") => {
		onUpdate(item.id, "type", newType);
		onUpdate(item.id, "name", getDefaultNameForType(newType));
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent title={`${item.name} Settings`} className="max-w-md">
				<DialogClose onClose={onClose} />

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Interval Name</Label>
						<Input
							value={item.name}
							onChange={(e) => onUpdate(item.id, "name", e.target.value)}
							placeholder="Interval name"
						/>
					</div>

					<div className="space-y-2">
						<Label>Duration (seconds)</Label>
						<NumberInput
							value={item.duration}
							onChange={(value) => onUpdate(item.id, "duration", value)}
							min={1}
							step={5}
						/>
					</div>

					<div className="space-y-2">
						<Label>Interval Type</Label>
						<select
							value={item.type}
							onChange={(e) =>
								handleTypeChange(e.target.value as "prepare" | "work" | "rest")
							}
							className="w-full rounded-md border px-3 py-2"
						>
							<option value="prepare">Prepare</option>
							<option value="work">Work</option>
							<option value="rest">Rest</option>
						</select>
					</div>

					<ColorPicker
						label="Custom Color"
						value={itemColor}
						onChange={(color) => onUpdate(item.id, "color", color)}
					/>

					<div className="flex items-center gap-2">
						<Checkbox
							id={`skip-last-${item.id}`}
							checked={Boolean(item.skipOnLastLoop)}
							onCheckedChange={(checked) =>
								onUpdate(item.id, "skipOnLastLoop", checked)
							}
						/>
						<Label htmlFor={`skip-last-${item.id}`} className="text-sm">
							Skip on last loop
						</Label>
					</div>

					<div className="flex gap-2">
						<Button
							onClick={() => {
								onMoveToTop(item.id);
								onClose();
							}}
							variant="outline"
							className="flex-1 gap-2"
						>
							↑ Top
						</Button>
						<Button
							onClick={() => {
								onMoveToBottom(item.id);
								onClose();
							}}
							variant="outline"
							className="flex-1 gap-2"
						>
							↓ Bottom
						</Button>
					</div>

					<div className="flex gap-2 pt-4">
						<Button
							onClick={() => {
								onDuplicate(item.id);
								onClose();
							}}
							variant="outline"
							className="flex-1 gap-2"
						>
							<Copy size={16} />
							Duplicate
						</Button>
						<Button
							onClick={() => {
								onDelete(item.id);
								onClose();
							}}
							variant="destructive"
							className="flex-1 gap-2"
						>
							<Trash2 size={16} />
							Delete
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// Sortable Item Component
function SortableItem({
	item,
	onUpdate,
	onRemove,
	onToggleCollapse,
	onAddToLoop,
	onDuplicate,
	onMoveToTop,
	onMoveToBottom,
	activeId,
	isNested = false,
	colors,
}: {
	item: WorkoutItem;
	onUpdate: (id: string, field: string, value: any) => void;
	onRemove: (id: string) => void;
	onToggleCollapse?: (id: string) => void;
	onAddToLoop?: (loopId: string) => void;
	onDuplicate?: (id: string) => void;
	onMoveToTop?: (id: string) => void;
	onMoveToBottom?: (id: string) => void;
	activeId: string | null | undefined;
	isNested?: boolean;
	colors: ColorSettings;
}) {
	const [showSettings, setShowSettings] = useState(false);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
		isOver,
	} = useSortable({ id: item.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const isActiveDropTarget = activeId && activeId !== item.id && isLoop(item);

	// Get colors based on item type
	const getItemColors = () => {
		if (isLoop(item)) {
			const color = item.color || (isNested ? colors.nestedLoop : colors.loop);
			return {
				borderColor: color,
				bgColor: `${color}20`,
			};
		} else {
			const color = item.color || colors[item.type];
			return {
				borderColor: color,
				bgColor: `${color}20`,
			};
		}
	};

	const { borderColor, bgColor } = getItemColors();

	if (isLoop(item)) {
		return (
			<>
				<div ref={setNodeRef} style={style} className="relative space-y-2">
					{/* Item ID badge */}
					<span className="absolute right-0 top-0 z-10 m-1 select-all rounded bg-muted px-1 text-xs text-muted-foreground">
						{item.id}
					</span>
					{/* Loop Header */}
					<div
						className={`rounded-lg border-2 border-dashed p-3 ${
							isActiveDropTarget ? "border-blue-400 bg-blue-100" : ""
						}`}
						style={{
							borderColor: isActiveDropTarget ? "#3b82f6" : borderColor,
							backgroundColor: isActiveDropTarget ? "#dbeafe" : bgColor,
						}}
					>
						<div className="flex items-center gap-2 sm:gap-3">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onToggleCollapse?.(item.id)}
								className="h-8 w-8 shrink-0 p-0"
							>
								{item.collapsed ? (
									<ChevronRight size={16} />
								) : (
									<ChevronDown size={16} />
								)}
							</Button>

							<Repeat
								size={16}
								style={{ color: borderColor }}
								className="shrink-0"
							/>

							<Input
								value={item.name}
								onChange={(e) => onUpdate(item.id, "name", e.target.value)}
								className="min-w-[120px] flex-1"
								placeholder="Loop name"
							/>

							<div className="flex shrink-0 items-center gap-1 sm:gap-2">
								<span className="text-sm text-muted-foreground">×</span>
								<NumberInput
									value={item.loops}
									onChange={(value) => onUpdate(item.id, "loops", value)}
									min={1}
									step={1}
									className="w-20 min-w-[80px] sm:w-24"
								/>
							</div>

							<div className="flex shrink-0 gap-1 sm:gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => onAddToLoop?.(item.id)}
									className="min-w-[60px] gap-1 px-2 sm:min-w-[80px] sm:px-3"
								>
									<Plus size={12} />
									<span className="hidden sm:inline">Add</span>
								</Button>

								<Button
									variant="ghost"
									size="icon"
									onClick={() => setShowSettings(true)}
									className="h-8 w-8 sm:h-9 sm:w-9"
								>
									<Settings size={14} />
								</Button>

								<div
									{...attributes}
									{...listeners}
									className="flex h-8 w-8 cursor-grab items-center justify-center sm:h-9 sm:w-9"
								>
									<GripVertical size={16} className="text-gray-400" />
								</div>
							</div>
						</div>
					</div>

					{/* C-shaped container for loop items */}
					{!item.collapsed && (
						<div className="relative">
							{/* Enhanced C-shape visual wrapper using border style */}
							<div
								className="absolute bottom-2 left-6 top-2 w-0 border-l-2 border-dashed"
								style={{ borderColor: borderColor }}
							/>
							<div
								className="absolute left-4 top-2 h-0 w-4 border-t-2 border-dashed"
								style={{ borderColor: borderColor }}
							/>
							<div
								className="absolute bottom-2 left-4 h-0 w-4 border-b-2 border-dashed"
								style={{ borderColor: borderColor }}
							/>

							{/* Loop content with proper spacing */}
							<div className="ml-12 mr-4 space-y-2">
								{item.items.length > 0 ? (
									<DroppableZone
										id={`drop-${item.id}`}
										isOver={Boolean(isActiveDropTarget)}
										className="space-y-2"
									>
										<SortableContext
											items={item.items.map((subItem) => subItem.id)}
											strategy={verticalListSortingStrategy}
										>
											{item.items.map((subItem, idx) => (
												<div key={subItem.id} className="relative">
													{/* Drop indicator before the first item */}
													{activeId && idx === 0 && (
														<DroppableZone
															id={`drop-before-${subItem.id}`}
															className="-my-2 h-4 bg-transparent"
															style={{ minHeight: 16 }}
														>
															{isOver && activeId !== subItem.id && (
																<div className="absolute left-0 right-0 top-0 h-2 rounded-full bg-blue-400 opacity-60" />
															)}
														</DroppableZone>
													)}
													<SortableItem
														item={subItem}
														onUpdate={onUpdate}
														onRemove={onRemove}
														onToggleCollapse={onToggleCollapse}
														onAddToLoop={onAddToLoop}
														onDuplicate={onDuplicate}
														onMoveToTop={onMoveToTop}
														onMoveToBottom={onMoveToBottom}
														activeId={activeId}
														isNested={true}
														colors={colors}
													/>
													{/* Drop indicator after each item */}
													<DroppableZone
														id={`drop-after-${subItem.id}`}
														className="-my-2 h-4 bg-transparent"
														style={{ minHeight: 16 }}
													>
														{isOver && activeId !== subItem.id && (
															<div className="absolute bottom-0 left-0 right-0 h-2 rounded-full bg-blue-400 opacity-60" />
														)}
													</DroppableZone>
												</div>
											))}
										</SortableContext>
									</DroppableZone>
								) : (
									<DroppableZone
										id={`empty-${item.id}`}
										className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center text-muted-foreground dark:border-gray-600 dark:bg-gray-800"
									>
										Drop intervals or loops here
									</DroppableZone>
								)}
							</div>
						</div>
					)}
				</div>

				<LoopSettingsDialog
					isOpen={showSettings}
					onClose={() => setShowSettings(false)}
					item={item}
					onUpdate={onUpdate}
					onDuplicate={() => onDuplicate?.(item.id)}
					onDelete={() => onRemove(item.id)}
					onMoveToTop={() => onMoveToTop?.(item.id)}
					onMoveToBottom={() => onMoveToBottom?.(item.id)}
					colors={colors}
				/>
			</>
		);
	}

	return (
		<>
			<div
				ref={setNodeRef}
				style={{
					...style,
					borderColor: isOver && activeId ? "#3b82f6" : borderColor,
					backgroundColor: isOver && activeId ? "#dbeafe" : bgColor,
				}}
				className={`relative flex items-center gap-2 rounded-lg border-2 p-2 transition-all duration-200 sm:gap-3 sm:p-3 ${
					isNested ? "border-opacity-60" : ""
				} ${isOver && activeId ? "border-blue-400 bg-blue-100 shadow-lg" : ""}`}
			>
				{/* Item ID badge */}
				<span className="absolute right-0 top-0 z-10 m-1 select-all rounded bg-muted px-1 text-xs text-muted-foreground">
					{item.id}
				</span>
				<Input
					value={item.name}
					onChange={(e) => onUpdate(item.id, "name", e.target.value)}
					className="min-w-[100px] flex-1"
					placeholder="Exercise name"
				/>

				<NumberInput
					value={item.duration}
					onChange={(value) => onUpdate(item.id, "duration", value)}
					min={1}
					step={5}
					className="w-24 min-w-[90px] sm:w-32"
				/>

				<div className="flex shrink-0 gap-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setShowSettings(true)}
						className="h-8 w-8 sm:h-9 sm:w-9"
					>
						<Settings size={14} />
					</Button>
				</div>

				<div
					{...attributes}
					{...listeners}
					className="flex h-8 w-8 cursor-grab items-center justify-center sm:h-9 sm:w-9"
				>
					<GripVertical size={16} className="text-gray-400" />
				</div>
			</div>

			<IntervalSettingsDialog
				isOpen={showSettings}
				onClose={() => setShowSettings(false)}
				item={item}
				onUpdate={onUpdate}
				onDuplicate={() => onDuplicate?.(item.id)}
				onDelete={() => onRemove(item.id)}
				onMoveToTop={() => onMoveToTop?.(item.id)}
				onMoveToBottom={() => onMoveToBottom?.(item.id)}
				colors={colors}
			/>
		</>
	);
}

export function AdvancedTimer() {
	const [config, setConfig] = useState<AdvancedConfig>({
		items: [
			{ id: "1", name: "PREPARE", duration: 5, type: "prepare" },
			{
				id: "2",
				name: "MAIN WORKOUT",
				loops: 3,
				items: [
					{ id: "3", name: "WORK", duration: 30, type: "work" },
					{ id: "4", name: "REST", duration: 10, type: "rest" },
				],
				collapsed: false,
			},
		],
		colors: {
			prepare: "#f97316", // orange
			work: "#22c55e", // green
			rest: "#3b82f6", // blue
			loop: "#8b5cf6", // purple
			nestedLoop: "#f59e0b", // amber
		},
	});

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
					loopName: string;
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
						loopName: string;
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
								loopName: item.name,
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
											loopName: item.name,
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

	// Drag and drop sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	// Memoized utility functions
	const findItemById = useCallback(
		(items: WorkoutItem[], id: string): WorkoutItem | null => {
			for (const item of items) {
				if (item.id === id) return item;
				if (isLoop(item)) {
					const found = findItemById(item.items, id);
					if (found) return found;
				}
			}
			return null;
		},
		[],
	);

	const removeItemById = useCallback(
		(items: WorkoutItem[], id: string): WorkoutItem[] => {
			return items
				.filter((item) => item.id !== id)
				.map((item) => {
					if (isLoop(item)) {
						return { ...item, items: removeItemById(item.items, id) };
					}
					return item;
				});
		},
		[],
	);

	const addItemToLoop = useCallback(
		(
			items: WorkoutItem[],
			loopId: string,
			newItem: WorkoutItem,
		): WorkoutItem[] => {
			return items.map((item) => {
				if (item.id === loopId && isLoop(item)) {
					return { ...item, items: [...item.items, newItem] };
				}
				if (isLoop(item)) {
					return { ...item, items: addItemToLoop(item.items, loopId, newItem) };
				}
				return item;
			});
		},
		[],
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

	// Enhanced drag handlers with nested support
	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	}, []);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			setActiveId(null);

			if (!over) return;

			const activeIdStr = active.id as string;
			const overIdStr = over.id as string;
			console.log({ activeIdStr, overIdStr, active, over });

			// Find which loop contains an item (if any)
			const findItemLocation = (
				items: WorkoutItem[],
				targetId: string,
				parentLoopId?: string,
			): { loopId?: string; index: number } | null => {
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
			console.log({ activeLocation, overLocation });

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

			// Handle dropping from outside into a loop at specific position (PRIORITY)
			if (overLocation && overLocation.loopId && !activeLocation?.loopId) {
				setConfig((prev) => {
					const result = findAndRemoveItem(prev.items);
					if (result.removedItem && overLocation.loopId) {
						const insertIntoLoop = (items: WorkoutItem[]): WorkoutItem[] => {
							return items.map((item) => {
								if (isLoop(item) && item.id === overLocation.loopId) {
									const newItems = [...item.items];
									const targetItemIndex = item.items.findIndex(
										(subItem) => subItem.id === overIdStr,
									);

									if (targetItemIndex !== -1) {
										// Insert after the target item (more intuitive)
										newItems.splice(
											targetItemIndex + 1,
											0,
											result.removedItem!,
										);
									} else {
										// Fallback: append to end if target not found
										newItems.push(result.removedItem!);
									}

									return { ...item, items: newItems };
								} else if (isLoop(item)) {
									return { ...item, items: insertIntoLoop(item.items) };
								}
								return item;
							});
						};

						return {
							...prev,
							items: insertIntoLoop(result.items),
						};
					}
					return prev;
				});
				return;
			}

			// Handle dropping into a loop (drop zones) - ONLY for empty areas
			if (overIdStr.startsWith("drop-") || overIdStr.startsWith("empty-")) {
				const targetLoopId = overIdStr
					.replace("drop-", "")
					.replace("empty-", "");

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

			// Handle dropping onto main container area (move out of loop to end)
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

			// Handle reordering within the same loop
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
		[addItemToLoop, config.items],
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
	}, [state]); // Remove config dependency to prevent constant recalculation

	// Separate effect for config changes
	useEffect(() => {
		if (state === "idle" && flattenedIntervals.length > 0) {
			setTimeLeft(flattenedIntervals[0].duration);
			setCurrentType(mapIntervalTypeToTimerType(flattenedIntervals[0].type));
			setCurrentItemIndex(0);
		}
	}, [flattenedIntervals]); // Only when flattened intervals change

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
	}, [state, timeLeft]); // Keep this as is

	const handleTimerComplete = useCallback(() => {
		const nextIndex = currentItemIndex + 1;

		if (nextIndex < flattenedIntervals.length) {
			const nextInterval = flattenedIntervals[nextIndex];
			setCurrentItemIndex(nextIndex);
			setCurrentType(mapIntervalTypeToTimerType(nextInterval.type));
			setTimeLeft(nextInterval.duration);

			const intervalName = nextInterval.loopInfo
				? `${nextInterval.loopInfo.loopName} (${nextInterval.loopInfo.iteration}) - ${nextInterval.name}`
				: nextInterval.name;

			timerToasts.nextInterval(intervalName);
		} else {
			setCompleted("🎉 Advanced Workout Complete! Great job!");
		}
	}, [currentItemIndex, flattenedIntervals, setCompleted]);

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
		() => baseHoldStart(stopTimer),
		[baseHoldStart, stopTimer],
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
	}, [state, timeLeft, currentItemIndex, flattenedIntervals]);

	// Item management functions with useCallback for performance
	const addInterval = useCallback(() => {
		const newInterval: IntervalStep = {
			id: Date.now().toString(),
			name: "NEW EXERCISE",
			duration: 30,
			type: "work",
		};
		setConfig((prev) => ({
			...prev,
			items: [...prev.items, newInterval],
		}));
	}, []);

	const addLoop = useCallback(() => {
		const newLoop: LoopGroup = {
			id: Date.now().toString(),
			name: "NEW LOOP",
			loops: 3,
			items: [],
			collapsed: false,
		};
		setConfig((prev) => ({
			...prev,
			items: [...prev.items, newLoop],
		}));
	}, []);

	const addToLoop = useCallback(
		(loopId: string) => {
			const newInterval: IntervalStep = {
				id: Date.now().toString(),
				name: "NEW EXERCISE",
				duration: 30,
				type: "work",
			};

			setConfig((prev) => ({
				...prev,
				items: addItemToLoop(prev.items, loopId, newInterval),
			}));
		},
		[addItemToLoop],
	);

	const removeItem = useCallback(
		(id: string) => {
			setConfig((prev) => ({
				...prev,
				items: removeItemById(prev.items, id),
			}));
		},
		[removeItemById],
	);

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

	const duplicateItem = useCallback((id: string) => {
		const duplicateRecursive = (items: WorkoutItem[]): WorkoutItem[] => {
			const newItems: WorkoutItem[] = [];

			for (const item of items) {
				newItems.push(item);

				if (item.id === id) {
					// Create a duplicate with a new ID
					if (isInterval(item)) {
						const duplicate: IntervalStep = {
							...item,
							id: Date.now().toString() + "-duplicate",
							name: `${item.name} (Copy)`,
						};
						newItems.push(duplicate);
					} else if (isLoop(item)) {
						const duplicate: LoopGroup = {
							...item,
							id: Date.now().toString() + "-duplicate",
							name: `${item.name} (Copy)`,
							items: [...item.items], // Shallow copy of items
						};
						newItems.push(duplicate);
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
	}, []);

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

	const getCurrentIntervalName = useCallback(() => {
		if (!currentInterval) return "PREPARE";

		return currentInterval.loopInfo
			? `${currentInterval.loopInfo.loopName} (${currentInterval.loopInfo.iteration}) - ${currentInterval.name}`
			: currentInterval.name;
	}, [currentInterval]);

	const getTimerProgress = useCallback(() => {
		if (!currentInterval) return 0;
		return getProgress(currentInterval.duration, timeLeft);
	}, [currentInterval, timeLeft]);

	// Navigation functions
	const fastForward = useCallback(() => {
		if (state === "idle" || state === "completed") return;

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
			colors: {
				prepare: "#f97316", // orange
				work: "#22c55e", // green
				rest: "#3b82f6", // blue
				loop: "#8b5cf6", // purple
				nestedLoop: "#f59e0b", // amber
			},
		}));
	}, []);

	// Check if we should show minimalistic view
	const isMinimalisticView = state === "running" || state === "paused";

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
				console.log("onDragStart", event);
			},
			// onDragMove(event) {
			// 	console.log("onDragMove", event);
			// },
			onDragOver(event) {
				console.log("onDragOver", event);
			},
			onDragEnd(event) {
				console.log("onDragEnd", event);
			},
			// onDragCancel(event) {
			// 	console.log("onDragCancel", event);
			// },
		});
		return null;
	};

	return (
		<div className="relative space-y-6">
			{/* Minimalistic view when timer is running */}
			{isMinimalisticView && (
				<MinimalisticContainer>
					<MinimalisticTimerView
						timeLeft={timeLeft}
						state={state}
						currentSet={1}
						totalSets={1}
						intervalType={getIntervalTypeForDisplay(currentType)}
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
					/>
				</MinimalisticContainer>
			)}

			{!isMinimalisticView && (
				<Card>
					<CardContent className="space-y-6 pt-6">
						<div className="space-y-4 text-center">
							<div className="flex flex-wrap items-center justify-center gap-4">
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

						<div className="space-y-4">
							<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
								<h3 className="text-lg font-semibold">Workout Sequence</h3>
								<div className="flex flex-wrap gap-2">
									<Button
										onClick={addInterval}
										variant="outline"
										size="sm"
										className="gap-2"
									>
										<Plus size={16} />
										Add Interval
									</Button>
									<Button
										onClick={addLoop}
										variant="outline"
										size="sm"
										className="gap-2"
									>
										<Repeat size={16} />
										Add Loop
									</Button>
									<Button
										onClick={() => setShowSettings(true)}
										variant="outline"
										size="sm"
										className="gap-2"
									>
										<Settings size={16} />
										Settings
									</Button>
								</div>
							</div>

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
										className="max-h-96 space-y-3 overflow-y-auto"
									>
										{config.items.map((item) => (
											<SortableItem
												key={item.id}
												item={item}
												onUpdate={updateItem}
												onRemove={removeItem}
												onToggleCollapse={toggleLoopCollapse}
												onAddToLoop={addToLoop}
												onDuplicate={duplicateItem}
												onMoveToTop={moveToTop}
												onMoveToBottom={moveToBottom}
												activeId={activeId}
												colors={config.colors}
											/>
										))}
									</DroppableZone>
								</SortableContext>

								<DragOverlay>
									{activeId ? (
										<div className="rounded-lg border bg-white p-3 shadow-lg">
											<div className="text-sm font-medium">
												{findItemById(config.items, activeId)?.name || "Item"}
											</div>
										</div>
									) : null}
								</DragOverlay>
							</DndContext>
						</div>

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
					</CardContent>
				</Card>
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

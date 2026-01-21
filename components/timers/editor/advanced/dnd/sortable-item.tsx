"use client";

import IntervalSettingsDialog from "@/components/timers/editor/advanced/dnd/dialogs/interval-settings-dialog";
import LoopSettingsDialog from "@/components/timers/editor/advanced/dnd/dialogs/loop-settings-dialog";
import { DroppableZone } from "@/components/timers/editor/advanced/dnd/droppable-zone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { TimeInput } from "@/components/ui/time-input";
import {
	ColorSettings,
	IntervalStep,
	isLoop,
	WorkoutItem,
} from "@/types/advanced-timer";
import { computeTotalTime } from "@/utils/compute-total-time";
import { formatTimeInput } from "@/utils/timer-shared";
import { useDndContext } from "@dnd-kit/core";
import {
	SortableContext,
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
	Settings,
	Trash2,
} from "lucide-react";
import { useState } from "react";

interface Props {
	item: WorkoutItem;
	onUpdate: (id: string, field: string, value: any) => void;
	onRemove: (id: string) => void;
	onToggleCollapse?: (id: string) => void;
	onAddToLoop?: (loopId: string) => void;
	onDuplicate?: (id: string) => void;
	onMoveUp?: (id: string) => void;
	onMoveDown?: (id: string) => void;
	onMoveToTop?: (id: string) => void;
	onMoveToBottom?: (id: string) => void;
	activeId: string | null | undefined;
	isNested?: boolean;
	colors: ColorSettings;
}

export function SortableItem(props: Props) {
	const {
		item,
		onUpdate,
		onRemove,
		onToggleCollapse,
		onAddToLoop,
		onDuplicate,
		onMoveUp,
		onMoveDown,
		onMoveToTop,
		onMoveToBottom,
		activeId,
		isNested = false,
		colors,
	} = props;

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

	// Detect if a drag operation is currently active
	const { active } = useDndContext();

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const isActiveDropTarget =
		!!active && activeId && activeId !== item.id && isLoop(item);

	// Resolve colors
	const { borderColor, bgColor } = (() => {
		if (isLoop(item)) {
			const color = item.color || (isNested ? colors.nestedLoop : colors.loop);
			return { borderColor: color, bgColor: `${color}20` };
		}
		const color = item.color || colors[item.type];
		return { borderColor: color, bgColor: `${color}20` };
	})();

	// ============ LOOP RENDER ============
	if (isLoop(item)) {
		const loopLength = formatTimeInput(computeTotalTime([item]));
		return (
			<>
				<div ref={setNodeRef} style={style} className="relative space-y-2">
					<div
						className="rounded-lg border-2 border-dashed p-3"
						style={{
							borderColor: isActiveDropTarget
								? "hsl(var(--brand))"
								: borderColor,
							backgroundColor: isActiveDropTarget
								? "hsl(var(--brand) / 0.12)"
								: bgColor,
						}}
					>
						<div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
							{/* Mobile layout - Line 1: Grip + Set count + Collapse */}
							<div className="flex w-full items-center justify-between gap-2 sm:hidden">
								<div
									{...attributes}
									{...listeners}
									className="flex h-10 w-10 cursor-grab touch-manipulation items-center justify-center sm:h-8 sm:w-8"
									data-dnd-draggable="true"
									style={{ touchAction: "none" }}
								>
									<GripVertical size={16} className="text-gray-400" />
								</div>

								<NumberInput
									value={item.loops}
									onChange={(v) => onUpdate(item.id, "loops", v)}
									min={0}
									step={1}
									className="w-[50px] min-w-0 flex-shrink"
									placeholder="Sets"
								/>

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
							</div>

							{/* Desktop layout - Grip + Collapse */}
							<div className="hidden items-center gap-2 sm:flex">
								<div
									{...attributes}
									{...listeners}
									className="flex h-10 w-10 cursor-grab touch-manipulation items-center justify-center sm:h-8 sm:w-8"
									data-dnd-draggable="true"
									style={{ touchAction: "none" }}
								>
									<GripVertical size={16} className="text-gray-400" />
								</div>

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
							</div>

							<div className="flex w-full flex-col gap-2">
								{/* Desktop layout - Sets */}
								<div className="hidden w-full items-center gap-1 sm:flex">
									<NumberInput
										value={item.loops}
										onChange={(v) => onUpdate(item.id, "loops", v)}
										min={0}
										step={1}
										className="w-[50px] min-w-0 flex-shrink"
										placeholder="Sets"
									/>
								</div>

								{/* Mobile layout - Line 2: Add Interval + Feature buttons */}
								<div className="flex w-full items-center justify-between gap-2 sm:hidden">
									<Button
										variant="control"
										size="sm"
										onClick={() => onAddToLoop?.(item.id)}
										className="gap-1 px-2"
									>
										<Plus size={12} />
										<span className="">Add Interval</span>
									</Button>

									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDuplicate?.(item.id)}
											className="h-7 w-7"
											title="Duplicate loop"
										>
											<Copy size={12} />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onRemove(item.id)}
											className="h-7 w-7 text-destructive hover:text-destructive"
											title="Delete loop"
										>
											<Trash2 size={12} />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setShowSettings(true)}
											className="h-7 w-7"
											title="Loop settings"
										>
											<Settings size={12} />
										</Button>
									</div>
								</div>

								{/* Desktop layout - actions and total */}
								<div className="hidden w-full items-center justify-between gap-2 sm:flex">
									<Button
										variant="control"
										size="sm"
										onClick={() => onAddToLoop?.(item.id)}
										className="gap-1 px-2"
									>
										<Plus size={12} />
										<span className="">Add Interval</span>
									</Button>

									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDuplicate?.(item.id)}
											className="h-7 w-7"
											title="Duplicate loop"
										>
											<Copy size={12} />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onRemove(item.id)}
											className="h-7 w-7 text-destructive hover:text-destructive"
											title="Delete loop"
										>
											<Trash2 size={12} />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setShowSettings(true)}
											className="h-7 w-7"
											title="Loop settings"
										>
											<Settings size={12} />
										</Button>
									</div>

									<span className="text-xs text-muted-foreground">
										Total: {loopLength}
									</span>
								</div>
							</div>
						</div>

						{/* NESTED ITEMS INSIDE THE PURPLE BORDER */}
						{!item.collapsed && (
							<div className="relative mt-4">
								{/* Items inside the loop with proper padding from the edges */}
								<div className="px-0 pb-2">
									{item.items.length ? (
										<>
											<DroppableZone
												id={`drop-${item.id}`}
												isOver={Boolean(isActiveDropTarget)}
												className=""
											>
												<SortableContext
													items={item.items.map((s) => s.id)}
													strategy={verticalListSortingStrategy}
												>
													<div className="space-y-3">
														{item.items.map((subItem, idx) => (
															<div key={subItem.id} className="relative">
																{activeId && idx === 0 && (
																	<DroppableZone
																		id={`drop-before-${subItem.id}`}
																		className="-my-3 h-6 bg-transparent"
																		style={{ minHeight: 24 }}
																	>
																		<span className="sr-only">before-drop</span>
																	</DroppableZone>
																)}
																<SortableItem
																	item={subItem}
																	onUpdate={onUpdate}
																	onRemove={onRemove}
																	onToggleCollapse={onToggleCollapse}
																	onAddToLoop={onAddToLoop}
																	onDuplicate={onDuplicate}
																	onMoveUp={onMoveUp}
																	onMoveDown={onMoveDown}
																	onMoveToTop={onMoveToTop}
																	onMoveToBottom={onMoveToBottom}
																	activeId={activeId}
																	isNested
																	colors={colors}
																/>
																<DroppableZone
																	id={`drop-after-${subItem.id}`}
																	className="-my-3 h-6 bg-transparent"
																	style={{ minHeight: 24 }}
																>
																	<span className="sr-only">after-drop</span>
																</DroppableZone>
															</div>
														))}
													</div>
												</SortableContext>
											</DroppableZone>

											{/* Mobile total time display after intervals */}
											<div className="flex justify-end pt-2 sm:hidden">
												<span className="text-xs text-muted-foreground">
													Total: {loopLength}
												</span>
											</div>
										</>
									) : (
										<div className="flex w-full items-center justify-between">
											<DroppableZone
												id={`empty-${item.id}`}
												className="flex-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-left text-muted-foreground dark:border-gray-600 dark:bg-gray-800"
											>
												Drop intervals here
											</DroppableZone>
											<span className="ml-2 text-xs text-muted-foreground">
												Total: {loopLength}
											</span>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>

				<LoopSettingsDialog
					isOpen={showSettings}
					onClose={() => setShowSettings(false)}
					item={item}
					onUpdate={onUpdate}
					onMoveUp={() => onMoveUp?.(item.id)}
					onMoveDown={() => onMoveDown?.(item.id)}
					onMoveToTop={() => onMoveToTop?.(item.id)}
					onMoveToBottom={() => onMoveToBottom?.(item.id)}
					colors={colors}
				/>
			</>
		);
	}

	// ============ INTERVAL RENDER ============
	const interval = item as IntervalStep;
	return (
		<>
			<div
				ref={setNodeRef}
				style={{
					...style,
					borderColor: isOver && activeId ? "hsl(var(--brand))" : borderColor,
					backgroundColor:
						isOver && activeId ? "hsl(var(--brand) / 0.1)" : bgColor,
				}}
				className={`relative rounded-lg border-2 p-2 transition-all duration-200 sm:p-3 ${
					isNested ? "border-opacity-60" : ""
				} ${isOver && activeId ? "shadow-lg" : ""}`}
			>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
					{/* Line 1: GripVertical + NAME */}
					<div className="flex items-center gap-2 sm:flex-1">
						<div
							{...attributes}
							{...listeners}
							className="flex h-10 w-10 cursor-grab touch-manipulation items-center justify-center sm:h-8 sm:w-8"
							data-dnd-draggable="true"
							style={{ touchAction: "none" }}
						>
							<GripVertical size={16} className="text-gray-400" />
						</div>
						<Input
							value={interval.name}
							onChange={(e) => onUpdate(interval.id, "name", e.target.value)}
							className="flex-1"
							placeholder="Exercise name"
						/>
					</div>

					{/* Line 2: TIME setter + action buttons (mobile) / TIME setter (desktop) */}
					<div className="flex items-center justify-between gap-2 sm:min-w-[90px] sm:justify-center">
						<TimeInput
							value={interval.duration}
							onChange={(v: number) => onUpdate(interval.id, "duration", v)}
							// Increased width for mobile usability
							className="w-28 max-w-[140px] sm:w-full"
							placeholder="__:__"
						/>

						{/* Mobile action buttons */}
						<div className="flex justify-center gap-1 sm:hidden">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onDuplicate?.(interval.id)}
								className="h-8 w-8"
								title="Duplicate interval"
							>
								<Copy size={14} />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onRemove(interval.id)}
								className="h-8 w-8 text-destructive hover:text-destructive"
								title="Delete interval"
							>
								<Trash2 size={14} />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShowSettings(true)}
								className="h-8 w-8"
								title="Interval settings"
							>
								<Settings size={14} />
							</Button>
						</div>
					</div>

					{/* Desktop action buttons */}
					<div className="hidden justify-center gap-1 sm:flex">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onDuplicate?.(interval.id)}
							className="h-8 w-8"
							title="Duplicate interval"
						>
							<Copy size={14} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onRemove(interval.id)}
							className="h-8 w-8 text-destructive hover:text-destructive"
							title="Delete interval"
						>
							<Trash2 size={14} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setShowSettings(true)}
							className="h-8 w-8"
							title="Interval settings"
						>
							<Settings size={14} />
						</Button>
					</div>
				</div>
			</div>

			<IntervalSettingsDialog
				isOpen={showSettings}
				onClose={() => setShowSettings(false)}
				item={interval}
				onUpdate={onUpdate}
				onMoveUp={() => onMoveUp?.(interval.id)}
				onMoveDown={() => onMoveDown?.(interval.id)}
				onMoveToTop={() => onMoveToTop?.(interval.id)}
				onMoveToBottom={() => onMoveToBottom?.(interval.id)}
				colors={colors}
			/>
		</>
	);
}

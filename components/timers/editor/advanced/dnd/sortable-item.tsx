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
	LoopGroup,
	WorkoutItem,
} from "@/types/advanced-timer";
import { computeTotalTime } from "@/utils/compute-total-time";
import { formatTimeInput } from "@/utils/time-input";
import type {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from "@dnd-kit/core";
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

interface SortableItemSharedProps {
	onUpdate: Props["onUpdate"];
	onRemove: Props["onRemove"];
	onToggleCollapse?: Props["onToggleCollapse"];
	onAddToLoop?: Props["onAddToLoop"];
	onDuplicate?: Props["onDuplicate"];
	onMoveUp?: Props["onMoveUp"];
	onMoveDown?: Props["onMoveDown"];
	onMoveToTop?: Props["onMoveToTop"];
	onMoveToBottom?: Props["onMoveToBottom"];
	activeId: Props["activeId"];
	colors: ColorSettings;
}

interface LoopItemProps extends SortableItemSharedProps {
	item: LoopGroup;
	setNodeRef: (element: HTMLElement | null) => void;
	style: React.CSSProperties;
	attributes: DraggableAttributes;
	listeners: DraggableSyntheticListeners;
	isActiveDropTarget: boolean;
	borderColor: string;
	bgColor: string;
	isNested: boolean;
	showLoopSettings: boolean;
	onOpenLoopSettings: () => void;
	onCloseLoopSettings: () => void;
}

function SortableLoopItem({
	item,
	setNodeRef,
	style,
	attributes,
	listeners,
	isActiveDropTarget,
	borderColor,
	bgColor,
	isNested,
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
	colors,
	showLoopSettings,
	onOpenLoopSettings,
	onCloseLoopSettings,
}: LoopItemProps) {
	const loopLength = formatTimeInput(computeTotalTime([item]));
	return (
		<>
			<div ref={setNodeRef} style={style} className="relative space-y-2">
				<div
					className="rounded-lg border-2 border-dashed p-3"
					style={{
						borderColor: isActiveDropTarget ? "hsl(var(--brand))" : borderColor,
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
								{...(listeners ?? {})}
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
								{...(listeners ?? {})}
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
										onClick={onOpenLoopSettings}
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
										onClick={onOpenLoopSettings}
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
				isOpen={showLoopSettings}
				onClose={onCloseLoopSettings}
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

interface IntervalItemProps extends SortableItemSharedProps {
	item: IntervalStep;
	setNodeRef: (element: HTMLElement | null) => void;
	style: React.CSSProperties;
	attributes: DraggableAttributes;
	listeners: DraggableSyntheticListeners;
	isOver: boolean;
	borderColor: string;
	bgColor: string;
	isNested: boolean;
	showIntervalSettings: boolean;
	onOpenIntervalSettings: () => void;
	onCloseIntervalSettings: () => void;
}

function SortableIntervalItem({
	item,
	setNodeRef,
	style,
	attributes,
	listeners,
	isOver,
	activeId,
	borderColor,
	bgColor,
	isNested,
	onUpdate,
	onRemove,
	onDuplicate,
	onMoveUp,
	onMoveDown,
	onMoveToTop,
	onMoveToBottom,
	colors,
	showIntervalSettings,
	onOpenIntervalSettings,
	onCloseIntervalSettings,
}: IntervalItemProps) {
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
					<div className="flex items-center gap-2 sm:flex-1">
						<div
							{...attributes}
							{...(listeners ?? {})}
							className="flex h-10 w-10 cursor-grab touch-manipulation items-center justify-center sm:h-8 sm:w-8"
							data-dnd-draggable="true"
							style={{ touchAction: "none" }}
						>
							<GripVertical size={16} className="text-gray-400" />
						</div>
						<Input
							value={item.name}
							onChange={(e) => onUpdate(item.id, "name", e.target.value)}
							className="flex-1"
							placeholder="Exercise name"
						/>
					</div>

					<div className="flex items-center justify-between gap-2 sm:min-w-[90px] sm:justify-center">
						<TimeInput
							value={item.duration}
							onChange={(v: number) => onUpdate(item.id, "duration", v)}
							className="w-full sm:w-full"
							placeholder="__:__"
						/>

						<div className="flex justify-center gap-1 sm:hidden">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onDuplicate?.(item.id)}
								className="h-8 w-8"
								title="Duplicate interval"
							>
								<Copy size={14} />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onRemove(item.id)}
								className="h-8 w-8 text-destructive hover:text-destructive"
								title="Delete interval"
							>
								<Trash2 size={14} />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={onOpenIntervalSettings}
								className="h-8 w-8"
								title="Interval settings"
							>
								<Settings size={14} />
							</Button>
						</div>
					</div>

					<div className="hidden justify-center gap-1 sm:flex">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onDuplicate?.(item.id)}
							className="h-8 w-8"
							title="Duplicate interval"
						>
							<Copy size={14} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onRemove(item.id)}
							className="h-8 w-8 text-destructive hover:text-destructive"
							title="Delete interval"
						>
							<Trash2 size={14} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={onOpenIntervalSettings}
							className="h-8 w-8"
							title="Interval settings"
						>
							<Settings size={14} />
						</Button>
					</div>
				</div>
			</div>

			<IntervalSettingsDialog
				isOpen={showIntervalSettings}
				onClose={onCloseIntervalSettings}
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

	const [showLoopSettings, setShowLoopSettings] = useState(false);
	const [showIntervalSettings, setShowIntervalSettings] = useState(false);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
		isOver,
	} = useSortable({ id: item.id });

	const { active } = useDndContext();

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const isActiveDropTarget =
		!!active && activeId && activeId !== item.id && isLoop(item);

	const { borderColor, bgColor } = (() => {
		if (isLoop(item)) {
			const color = item.color || (isNested ? colors.nestedLoop : colors.loop);
			return { borderColor: color, bgColor: `${color}20` };
		}
		const color = item.color || colors[item.type];
		return { borderColor: color, bgColor: `${color}20` };
	})();

	if (isLoop(item)) {
		return (
			<SortableLoopItem
				item={item}
				setNodeRef={setNodeRef}
				style={style}
				attributes={attributes}
				listeners={listeners ?? undefined}
				isActiveDropTarget={Boolean(isActiveDropTarget)}
				borderColor={borderColor}
				bgColor={bgColor}
				isNested={isNested}
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
				colors={colors}
				showLoopSettings={showLoopSettings}
				onOpenLoopSettings={() => setShowLoopSettings(true)}
				onCloseLoopSettings={() => setShowLoopSettings(false)}
			/>
		);
	}

	return (
		<SortableIntervalItem
			item={item as IntervalStep}
			setNodeRef={setNodeRef}
			style={style}
			attributes={attributes}
			listeners={listeners ?? undefined}
			isOver={Boolean(isOver)}
			activeId={activeId}
			borderColor={borderColor}
			bgColor={bgColor}
			isNested={isNested}
			onUpdate={onUpdate}
			onRemove={onRemove}
			onDuplicate={onDuplicate}
			onMoveUp={onMoveUp}
			onMoveDown={onMoveDown}
			onMoveToTop={onMoveToTop}
			onMoveToBottom={onMoveToBottom}
			colors={colors}
			showIntervalSettings={showIntervalSettings}
			onOpenIntervalSettings={() => setShowIntervalSettings(true)}
			onCloseIntervalSettings={() => setShowIntervalSettings(false)}
		/>
	);
}

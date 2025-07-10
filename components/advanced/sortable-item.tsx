"use client";

import IntervalSettingsDialog from "@/components/advanced/dialogs/interval-settings-dialog";
import LoopSettingsDialog from "@/components/advanced/dialogs/loop-settings-dialog";
import { DroppableZone } from "@/components/advanced/droppable-zone";
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
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	ChevronDown,
	ChevronRight,
	GripVertical,
	Plus,
	Repeat,
	Settings,
} from "lucide-react";
import { useState } from "react";

interface Props {
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
}

export function SortableItem(props: Props) {
	const {
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

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const isActiveDropTarget = activeId && activeId !== item.id && isLoop(item);

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
		const loopLength = formatTimeInput(
			computeTotalTime(item.items) * item.loops,
		);
		return (
			<>
				<div ref={setNodeRef} style={style} className="relative space-y-2">
					{/* <span className="absolute right-0 top-0 z-10 m-1 select-all rounded bg-muted px-1 text-xs text-muted-foreground">
						{item.id}
					</span> */}
					<div
						className={`rounded-lg border-2 border-dashed p-3 ${
							isActiveDropTarget ? "border-blue-400 bg-blue-100" : ""
						}`}
						style={{
							borderColor: isActiveDropTarget ? "#3b82f6" : borderColor,
							backgroundColor: isActiveDropTarget ? "#dbeafe" : bgColor,
						}}
					>
						<div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
							{/* Drag handle at the end of the name */}
							<div
								{...attributes}
								{...listeners}
								className="flex h-8 w-8 cursor-grab items-center justify-center"
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

							<Repeat
								size={16}
								style={{ color: borderColor }}
								className="shrink-0"
							/>

							<div className="flex min-w-[120px] flex-1 items-center gap-2">
								<Input
									value={item.name}
									onChange={(e) => onUpdate(item.id, "name", e.target.value)}
									className="w-full"
									placeholder="Loop name"
								/>
							</div>

							<div className="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
								{/* Top row: input, sets, settings (always a row on desktop) */}
								<div className="flex w-full items-center gap-2 sm:w-auto">
									<NumberInput
										value={item.loops}
										onChange={(v) => onUpdate(item.id, "loops", v)}
										min={1}
										step={1}
										className="w-[50px] min-w-0 flex-shrink"
										placeholder="Sets"
									/>
									<span className="ml-1 text-xs text-muted-foreground sm:ml-2">
										sets
									</span>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setShowSettings(true)}
										className="ml-1 h-8 w-8 sm:ml-2"
									>
										<Settings size={14} />
									</Button>
								</div>
								{/* Bottom row: + button and total (only a new line on mobile) */}
								<div className="mt-2 flex w-full items-center sm:ml-2 sm:mt-0">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onAddToLoop?.(item.id)}
										className="min-w-[60px] gap-1 px-2"
									>
										<Plus size={12} />
										<span className="hidden sm:inline">Add</span>
									</Button>
									<div className="ml-auto flex items-center">
										<span className="text-xs text-muted-foreground">
											Total: {loopLength}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{!item.collapsed && (
						<div className="relative">
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

							<div className="ml-12 mr-4 space-y-2">
								{item.items.length ? (
									<>
										<DroppableZone
											id={`drop-${item.id}`}
											isOver={Boolean(isActiveDropTarget)}
											className="space-y-2"
										>
											<SortableContext
												items={item.items.map((s) => s.id)}
												strategy={verticalListSortingStrategy}
											>
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
											</SortableContext>
										</DroppableZone>
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

	// ============ INTERVAL RENDER ============
	const interval = item as IntervalStep;
	return (
		<>
			<div
				ref={setNodeRef}
				style={{
					...style,
					borderColor: isOver && activeId ? "#3b82f6" : borderColor,
					backgroundColor: isOver && activeId ? "#dbeafe" : bgColor,
				}}
				className={`relative flex items-center gap-2 rounded-lg border-2 p-2 transition-all duration-200 sm:p-3 ${
					isNested ? "border-opacity-60" : ""
				} ${isOver && activeId ? "border-blue-400 bg-blue-100 shadow-lg" : ""}`}
			>
				<div className="flex min-w-[100px] flex-1 items-center gap-2">
					{/* Drag handle at the end of the name */}
					<div
						{...attributes}
						{...listeners}
						className="flex h-8 w-8 cursor-grab items-center justify-center"
					>
						<GripVertical size={16} className="text-gray-400" />
					</div>
					<Input
						value={interval.name}
						onChange={(e) => onUpdate(interval.id, "name", e.target.value)}
						className="w-full"
						placeholder="Exercise name"
					/>
				</div>
				<div className="flex min-w-[90px] items-center gap-2">
					<TimeInput
						value={interval.duration}
						onChange={(v: number) => onUpdate(interval.id, "duration", v)}
						className="w-full"
						placeholder="__:__"
					/>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setShowSettings(true)}
					className="ml-auto h-8 w-8"
				>
					<Settings size={14} />
				</Button>
			</div>

			<IntervalSettingsDialog
				isOpen={showSettings}
				onClose={() => setShowSettings(false)}
				item={interval}
				onUpdate={onUpdate}
				onDuplicate={() => onDuplicate?.(interval.id)}
				onDelete={() => onRemove(interval.id)}
				onMoveToTop={() => onMoveToTop?.(interval.id)}
				onMoveToBottom={() => onMoveToBottom?.(interval.id)}
				colors={colors}
			/>
		</>
	);
}

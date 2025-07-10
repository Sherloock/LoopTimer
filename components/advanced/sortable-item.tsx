"use client";

import IntervalSettingsDialog from "@/components/advanced/dialogs/interval-settings-dialog";
import LoopSettingsDialog from "@/components/advanced/dialogs/loop-settings-dialog";
import { DroppableZone } from "@/components/advanced/droppable-zone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import {
	ColorSettings,
	IntervalStep,
	isLoop,
	WorkoutItem,
} from "@/types/advanced-timer";
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
								className="w-full min-w-[120px] flex-1 sm:w-auto"
								placeholder="Loop name"
							/>

							<div className="flex w-full items-center gap-1 sm:w-auto sm:gap-2">
								<NumberInput
									value={item.loops}
									onChange={(v) => onUpdate(item.id, "loops", v)}
									min={1}
									step={1}
									className="w-full min-w-[80px] sm:w-24"
								/>
							</div>

							<div className="flex w-full flex-wrap gap-1 sm:w-auto sm:flex-nowrap sm:gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => onAddToLoop?.(item.id)}
									className="min-w-[60px] gap-1 px-2 sm:min-w-[80px] sm:px-3"
								>
									<Plus size={12} />{" "}
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
								) : (
									<DroppableZone
										id={`empty-${item.id}`}
										className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center text-muted-foreground dark:border-gray-600 dark:bg-gray-800"
									>
										Drop intervals here
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
				className={`relative flex flex-wrap items-start gap-2 rounded-lg border-2 p-2 transition-all duration-200 sm:flex-nowrap sm:items-center sm:gap-3 sm:p-3 ${
					isNested ? "border-opacity-60" : ""
				} ${isOver && activeId ? "border-blue-400 bg-blue-100 shadow-lg" : ""}`}
			>
				{/* <span className="absolute right-0 top-0 z-10 m-1 select-all rounded bg-muted px-1 text-xs text-muted-foreground">
					{interval.id}
				</span> */}
				<Input
					value={interval.name}
					onChange={(e) => onUpdate(interval.id, "name", e.target.value)}
					className="w-full min-w-[100px] flex-1 sm:w-auto"
					placeholder="Exercise name"
				/>

				<NumberInput
					value={interval.duration}
					onChange={(v) => onUpdate(interval.id, "duration", v)}
					min={1}
					step={5}
					className="w-full min-w-[90px] sm:w-32"
				/>

				<div className="flex w-full flex-wrap gap-1 sm:w-auto sm:flex-nowrap">
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

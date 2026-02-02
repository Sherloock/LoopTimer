"use client";

import { DroppableZone } from "@/components/timers/editor/advanced/dnd/droppable-zone";
import { SortableItem } from "@/components/timers/editor/advanced/dnd/sortable-item";
import { findItemById } from "@/lib/timer-tree/tree-operations";
import type {
	AdvancedConfig,
	ColorSettings,
	WorkoutItem,
} from "@/types/advanced-timer";
import { isInterval } from "@/types/advanced-timer";
import type { useSensors } from "@dnd-kit/core";
import {
	type CollisionDetection,
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	useDndMonitor,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// DnD Monitor Component - must be inside DndContext
// Currently used for debugging/monitoring, handlers are empty
function DndMonitor() {
	useDndMonitor({
		onDragStart() {
			/* placeholder for debugging */
		},
		onDragOver() {
			/* placeholder for debugging */
		},
		onDragEnd() {
			/* placeholder for debugging */
		},
	});
	return null;
}

interface ItemOperations {
	onUpdate: (id: string, field: string, value: unknown) => void;
	onRemove: (id: string) => void;
	onToggleCollapse: (id: string) => void;
	onAddToLoop: (loopId: string) => void;
	onDuplicate: (id: string) => void;
	onMoveToTop: (id: string) => void;
	onMoveToBottom: (id: string) => void;
	onMoveUp: (id: string) => void;
	onMoveDown: (id: string) => void;
}

interface TimerEditorSortableListProps {
	config: AdvancedConfig;
	activeId: string | null;
	sensors: ReturnType<typeof useSensors>;
	collisionDetection: CollisionDetection;
	onDragStart: (event: DragStartEvent) => void;
	onDragEnd: (event: DragEndEvent) => void;
	colors: ColorSettings;
	itemOperations: ItemOperations;
}

/**
 * The main sortable list for the timer editor.
 * Contains the DnD context and renders all workout items.
 */
export function TimerEditorSortableList({
	config,
	activeId,
	sensors,
	collisionDetection,
	onDragStart,
	onDragEnd,
	colors,
	itemOperations,
}: TimerEditorSortableListProps) {
	return (
		<div className="space-y-4">
			<DndContext
				sensors={sensors}
				collisionDetection={collisionDetection}
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
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
							{config.items.map((item: WorkoutItem, idx: number) => (
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
										onUpdate={itemOperations.onUpdate}
										onRemove={itemOperations.onRemove}
										onToggleCollapse={itemOperations.onToggleCollapse}
										onAddToLoop={itemOperations.onAddToLoop}
										onDuplicate={itemOperations.onDuplicate}
										onMoveToTop={itemOperations.onMoveToTop}
										onMoveToBottom={itemOperations.onMoveToBottom}
										onMoveUp={itemOperations.onMoveUp}
										onMoveDown={itemOperations.onMoveDown}
										activeId={activeId}
										colors={colors}
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
	);
}

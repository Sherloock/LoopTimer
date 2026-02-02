"use client";

import { TimerEditorActions } from "@/components/timers/editor/advanced/timer-editor-actions";
import {
	TimerEditorDesktopHeader,
	TimerEditorMobileButtons,
} from "@/components/timers/editor/advanced/timer-editor-header";
import { TimerEditorSortableList } from "@/components/timers/editor/advanced/timer-editor-sortable-list";
import { TimelinePreview } from "@/components/timers/editor/timeline-preview";
import { TimerControls } from "@/components/timers/player/timer-controls";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/ui/stat-card";
import { TIMER_NAME_MAX_LENGTH } from "@/lib/constants/timers";
import { formatTime } from "@/lib/timer-utils";
import type { AdvancedConfig, ColorSettings } from "@/types/advanced-timer";
import type {
	CollisionDetection,
	DragEndEvent,
	DragStartEvent,
	useSensors,
} from "@dnd-kit/core";

export interface AdvancedTimerEditorPanelItemOperations {
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

export interface AdvancedTimerEditorPanelProps {
	config: AdvancedConfig;
	timerName: string;
	onTimerNameChange: (value: string) => void;
	timerColors: ColorSettings;
	totalSessionTime: number;
	flattenedIntervalsLength: number;
	onBack: () => void;
	onSave: () => void;
	isSaving: boolean;
	onOpenAiDialog: () => void;
	onOpenSaveTemplateDialog: () => void;
	onOpenShareDialog: () => void;
	onOpenSettings: () => void;
	onAddLoop: () => void;
	activeId: string | null;
	sensors: ReturnType<typeof useSensors>;
	collisionDetection: CollisionDetection;
	onDragStart: (event: DragStartEvent) => void;
	onDragEnd: (event: DragEndEvent) => void;
	itemOperations: AdvancedTimerEditorPanelItemOperations;
	editMode: boolean;
	state: "idle" | "running" | "paused" | "completed";
	onStart: () => void;
	onPause: () => void;
	onReset: () => void;
	onStop: () => void;
	onFastBackward: () => void;
	onFastForward: () => void;
}

export function AdvancedTimerEditorPanel({
	config,
	timerName,
	onTimerNameChange,
	timerColors,
	totalSessionTime,
	flattenedIntervalsLength,
	onBack,
	onSave,
	isSaving,
	onOpenAiDialog,
	onOpenSaveTemplateDialog,
	onOpenShareDialog,
	onOpenSettings,
	onAddLoop,
	activeId,
	sensors,
	collisionDetection,
	onDragStart,
	onDragEnd,
	itemOperations,
	editMode,
	state,
	onStart,
	onPause,
	onReset,
	onStop,
	onFastBackward,
	onFastForward,
}: AdvancedTimerEditorPanelProps) {
	return (
		<>
			<TimerEditorMobileButtons
				onBack={onBack}
				onSave={onSave}
				isSaving={isSaving}
			/>

			<Card>
				<TimerEditorDesktopHeader
					onBack={onBack}
					onSave={onSave}
					isSaving={isSaving}
				/>

				<CardContent className="space-y-6 p-1 pb-24 pt-2 md:p-6">
					{/* Timer Name and Stats */}
					<div className="flex flex-col gap-4 md:w-full md:flex-row md:justify-between">
						<div className="flex flex-col gap-4 md:flex-row md:gap-3">
							<div className="w-full md:flex-1">
								<div className="relative">
									<Input
										id="timer-name"
										className="peer w-full"
										value={timerName}
										onChange={(e) => onTimerNameChange(e.target.value)}
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
									<span
										id="timer-name-hint"
										className="pointer-events-none absolute bottom-1 right-3 z-10 text-[10px] leading-none text-muted-foreground"
									>
										{timerName.length}/{TIMER_NAME_MAX_LENGTH}
									</span>
								</div>
							</div>
						</div>
						<div className="flex w-full flex-wrap items-center justify-center gap-4 md:w-auto md:flex-row md:flex-nowrap md:justify-start">
							<StatCard
								label="Total Time"
								value={formatTime(totalSessionTime)}
								className="flex-1 md:flex-none"
							/>
							<StatCard
								label="Total Steps"
								value={flattenedIntervalsLength.toString()}
								valueClassName="text-2xl font-bold"
								className="flex-1 md:flex-none"
							/>
						</div>
					</div>

					{/* Timeline Preview and Actions */}
					<div className="flex flex-col gap-4">
						<div className="w-full">
							<Label className="mb-2 text-xs">Timeline Preview</Label>
							<TimelinePreview config={config} />
						</div>
						<TimerEditorActions
							timerName={timerName}
							config={config}
							onOpenAiDialog={onOpenAiDialog}
							onOpenSaveTemplateDialog={onOpenSaveTemplateDialog}
							onOpenShareDialog={onOpenShareDialog}
							onOpenSettings={onOpenSettings}
							onAddLoop={onAddLoop}
						/>
					</div>

					{/* Sortable Items List */}
					<TimerEditorSortableList
						config={config}
						activeId={activeId}
						sensors={sensors}
						collisionDetection={collisionDetection}
						onDragStart={onDragStart}
						onDragEnd={onDragEnd}
						colors={timerColors}
						itemOperations={itemOperations}
					/>

					{/* Timer Controls */}
					{!editMode && (
						<TimerControls
							state={state}
							onStart={onStart}
							onPause={onPause}
							onReset={onReset}
							onStop={onStop}
							onFastBackward={onFastBackward}
							onFastForward={onFastForward}
							startLabel="Start Advanced Timer"
							resetLabel="Start New Advanced Workout"
							disabled={flattenedIntervalsLength === 0}
						/>
					)}
				</CardContent>
			</Card>
		</>
	);
}

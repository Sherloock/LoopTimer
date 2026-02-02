"use client";

import { AdvancedTimerEditorPanel } from "@/components/timers/editor/advanced/advanced-timer-editor-panel";
import { UnsavedChangesDialog } from "@/components/timers/editor/advanced/unsaved-changes-dialog";
import { AiPromptDialog } from "@/components/timers/editor/ai-prompt-dialog";
import { SaveTemplateDialog } from "@/components/timers/editor/save-template-dialog";
import { TimerSettingsDialog } from "@/components/timers/editor/timer-settings-dialog";
import { UserPreferencesDialog } from "@/components/timers/editor/user-preferences-dialog";
import { MinimalisticContainer } from "@/components/timers/player/minimalistic-container";
import { RunningTimerView } from "@/components/timers/player/running-timer-view";
import { TimerCompletionScreen } from "@/components/timers/player/timer-completion-screen";
import { ShareDialog } from "@/components/timers/share/share-dialog";
import { useAdvancedTimerPlayback } from "@/hooks/timers/use-advanced-timer-playback";
import { useFlattenedIntervals } from "@/hooks/timers/use-flattened-intervals";
import { useTimerConfigManagement } from "@/hooks/timers/use-timer-config-management";
import { useTimerDragAndDrop } from "@/hooks/timers/use-timer-drag-and-drop";
import { useTimerPersistence } from "@/hooks/timers/use-timer-persistence";
import { useTimerSettings } from "@/hooks/timers/use-timer-settings";
import { useTimerState } from "@/hooks/use-timer-state";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { setMute } from "@/lib/sound-utils";
import { getProgress } from "@/lib/timer-utils";
import {
	type AdvancedConfig,
	isLoop,
	type LoadedTimer,
	type LoopGroup,
	type TimerType,
	type WorkoutItem,
} from "@/types/advanced-timer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ==================== Constants ====================

const DEFAULT_CONFIG: AdvancedConfig = {
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
};

// ==================== Component Props ====================

interface AdvancedTimerProps {
	loadedTimer?: LoadedTimer;
	onSaved?: (t: unknown) => void;
	onTimerNameChange?: (name: string) => void;
	editMode?: boolean;
	autoStart?: boolean;
	onExit?: () => void;
	onSaveComplete?: () => void;
	onComplete?: (timerName: string) => void;
	onMinimalisticViewChange?: (isMinimalistic: boolean) => void;
}

// ==================== Main Component ====================

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
	const { data: userPreferences } = useUserPreferences();

	// ==================== Config Management Hook ====================
	const {
		config,
		setConfig,
		setNextId,
		addInterval,
		addLoop,
		addToLoop,
		removeItem,
		updateItem,
		toggleLoopCollapse,
		duplicateItem,
		moveToTop,
		moveToBottom,
		moveUp,
		moveDown,
	} = useTimerConfigManagement({
		initialConfig: loadedTimer?.data
			? (loadedTimer.data as AdvancedConfig)
			: DEFAULT_CONFIG,
	});

	// Sync config when loadedTimer changes
	useEffect(() => {
		if (!loadedTimer?.data) return;

		const loadedData = loadedTimer.data as AdvancedConfig;
		setConfig(loadedData);

		const extractIds = (items: WorkoutItem[]): number[] => {
			return items.reduce<number[]>((acc, item) => {
				acc.push(parseInt(item.id, 10));
				if (isLoop(item)) acc.push(...extractIds(item.items));
				return acc;
			}, []);
		};

		const ids = extractIds(loadedData.items ?? []);
		const maxId = ids.length ? Math.max(...ids) : 0;
		setNextId(maxId + 1);
	}, [loadedTimer, setConfig, setNextId]);

	// ==================== DnD Hook ====================
	const {
		activeId,
		sensors,
		collisionDetection,
		handleDragStart,
		handleDragEnd,
	} = useTimerDragAndDrop({ config, setConfig });

	// ==================== Settings Hook ====================
	const settings = useTimerSettings({
		loadedTimer,
		userPreferences,
		onTimerNameChange,
	});

	// ==================== Persistence Hook ====================
	const persistence = useTimerPersistence({
		loadedTimer,
		timerData: {
			config,
			timerName: settings.timerName,
			timerCategory: settings.timerCategory,
			timerIcon: settings.timerIcon,
			timerColor: settings.timerColor,
			timerColors: settings.timerColors,
			timerIsSpeakNames: settings.timerIsSpeakNames,
			timerDefaultAlarm: settings.timerDefaultAlarm,
			timerDescription: settings.timerDescription,
		},
		onSaved,
		onSaveComplete,
		onExit,
	});

	// ==================== Timer State Hook ====================
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

	// Dialog visibility state
	const [showSettings, setShowSettings] = useState(false);
	const [showAiDialog, setShowAiDialog] = useState(false);
	const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
	const [showShareDialog, setShowShareDialog] = useState(false);
	const [showUserPreferencesDialog, setShowUserPreferencesDialog] =
		useState(false);

	// ==================== Flattened Intervals ====================
	const flattenedIntervals = useFlattenedIntervals(config.items);

	// ==================== Playback Hook ====================
	const playback = useAdvancedTimerPlayback({
		flattenedIntervals,
		state,
		setCurrentSet,
		baseStartTimer,
		timerDefaultAlarm: settings.timerDefaultAlarm,
		timerIsSpeakNames: settings.timerIsSpeakNames,
		timerName: settings.timerName,
		loadedTimer,
		autoStart,
		onComplete,
		setCompleted,
	});

	const {
		timeLeft,
		currentItemIndex,
		currentType,
		currentInterval,
		resetState,
		fastForward,
		fastBackward,
	} = playback;

	// ==================== Timer Control Wrappers ====================
	const startTimer = useCallback(() => {
		if (userPreferences && !userPreferences.isSound) {
			setMute(true);
		}
		baseStartTimer("Advanced Timer started!");
	}, [baseStartTimer, userPreferences]);

	const resetTimer = useCallback(
		() => baseResetTimer(resetState),
		[baseResetTimer, resetState],
	);

	const stopTimer = useCallback(
		() => baseStopTimer(resetState),
		[baseStopTimer, resetState],
	);

	const handleHoldStart = useCallback(
		() => baseHoldStart(() => onExit?.()),
		[baseHoldStart, onExit],
	);

	// ==================== Computed Values ====================

	const currentIntervalColor = useMemo(() => {
		if (!currentInterval) return undefined;
		return currentInterval.color || settings.timerColors[currentInterval.type];
	}, [currentInterval, settings.timerColors]);

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

		const hasCurrentInterval =
			flattenedIntervals.length > 0 &&
			currentItemIndex < flattenedIntervals.length;
		const currentIntervalProgress = hasCurrentInterval
			? getProgress(flattenedIntervals[currentItemIndex].duration, timeLeft) /
				100
			: 0;

		return Math.min(
			100,
			((currentItemIndex + currentIntervalProgress) / totalIntervals) * 100,
		);
	}, [state, flattenedIntervals, currentItemIndex, timeLeft]);

	const totalTimeRemaining = useMemo(() => {
		if (state === "idle" || state === "completed") return 0;
		let remaining = timeLeft;
		for (let i = currentItemIndex + 1; i < flattenedIntervals.length; i++) {
			remaining += flattenedIntervals[i].duration;
		}
		return remaining;
	}, [state, timeLeft, currentItemIndex, flattenedIntervals]);

	const nextIntervals = useMemo(() => {
		const result: Array<{
			name: string;
			type: TimerType;
			duration: number;
			color?: string;
		}> = [];
		for (let i = 1; i <= 2; i++) {
			const nextIndex = currentItemIndex + i;
			if (nextIndex < flattenedIntervals.length) {
				const next = flattenedIntervals[nextIndex];
				result.push({
					name: next.name,
					type: next.type,
					duration: next.duration,
					color: next.color || settings.timerColors[next.type],
				});
			}
		}
		return result;
	}, [currentItemIndex, flattenedIntervals, settings.timerColors]);

	const { currentLoopSet, totalLoopSets } = useMemo(() => {
		if (!currentInterval || !currentInterval.loopInfo) {
			return { currentLoopSet: 1, totalLoopSets: 1 };
		}

		let rootLoopInfo = currentInterval.loopInfo;
		while (rootLoopInfo.parentLoop) {
			rootLoopInfo = rootLoopInfo.parentLoop as typeof rootLoopInfo;
		}

		const findLoopItem = (items: WorkoutItem[]): LoopGroup | null => {
			for (const item of items) {
				if (isLoop(item)) {
					return item;
				}
			}
			return null;
		};

		const loopItem = findLoopItem(config.items);
		return {
			currentLoopSet: rootLoopInfo.iteration,
			totalLoopSets: loopItem?.loops || 1,
		};
	}, [currentInterval, config.items]);

	// ==================== View State ====================
	const isCompletionView = state === "completed";
	const isMinimalisticView = state === "running" || state === "paused";

	// Notify parent when minimalistic view changes
	useEffect(() => {
		onMinimalisticViewChange?.(isMinimalisticView);
	}, [isMinimalisticView, onMinimalisticViewChange]);

	// ==================== AI Generation Handler ====================
	const handleAiGenerated = useCallback(
		(generatedConfig: AdvancedConfig, generatedName?: string) => {
			setConfig(generatedConfig);

			if (generatedName) {
				settings.handleTimerNameChange(generatedName);
			}

			const extractIds = (items: WorkoutItem[]): number[] => {
				return items.reduce<number[]>((acc, item) => {
					acc.push(parseInt(item.id, 10));
					if (isLoop(item)) {
						acc.push(...extractIds(item.items));
					}
					return acc;
				}, []);
			};

			const ids = extractIds(generatedConfig.items ?? []);
			const maxId = ids.length ? Math.max(...ids) : 0;
			setNextId(maxId + 1);

			toast.success("Workout generated! Review and save when ready.", {
				id: "ai-workout-applied",
			});
		},
		[setConfig, setNextId, settings],
	);

	// ==================== Helper Functions ====================
	const getCurrentIntervalName = useCallback(() => {
		if (!currentInterval) return "PREPARE";
		return currentInterval.name;
	}, [currentInterval]);

	const getTimerProgress = useCallback(() => {
		if (!currentInterval) return 0;
		return getProgress(currentInterval.duration, timeLeft);
	}, [currentInterval, timeLeft]);

	// ==================== Render ====================
	return (
		<div className="relative">
			{/* Unsaved changes dialog */}
			<UnsavedChangesDialog
				open={persistence.showConfirmExit}
				onOpenChange={persistence.setShowConfirmExit}
				onDiscard={() => onExit?.()}
				onSaveAndExit={persistence.handleSaveAndExit}
				isPending={persistence.pendingExit}
			/>

			{/* Completion screen */}
			{isCompletionView && (
				<div className="fixed inset-0 flex items-center justify-center bg-background">
					<TimerCompletionScreen
						onBack={() => onExit?.()}
						onAgain={() => {
							resetTimer();
							startTimer();
						}}
						timerName={settings.timerName}
					/>
				</div>
			)}

			{/* Minimalistic view when running */}
			{isMinimalisticView && !isCompletionView && (
				<MinimalisticContainer>
					<RunningTimerView
						timeLeft={timeLeft}
						state={state}
						currentSet={currentLoopSet}
						totalSets={totalLoopSets}
						intervalType={currentType}
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
						nextIntervals={nextIntervals}
					/>
				</MinimalisticContainer>
			)}

			{/* Editor view */}
			{!isMinimalisticView && !isCompletionView && (
				<AdvancedTimerEditorPanel
					config={config}
					timerName={settings.timerName}
					onTimerNameChange={settings.handleTimerNameChange}
					timerColors={settings.timerColors}
					totalSessionTime={totalSessionTime}
					flattenedIntervalsLength={flattenedIntervals.length}
					onBack={persistence.handleBack}
					onSave={persistence.handleSave}
					isSaving={persistence.isSavingOrUpdating}
					onOpenAiDialog={() => setShowAiDialog(true)}
					onOpenSaveTemplateDialog={() => setShowSaveTemplateDialog(true)}
					onOpenShareDialog={() => setShowShareDialog(true)}
					onOpenSettings={() => setShowSettings(true)}
					onAddLoop={addLoop}
					activeId={activeId}
					sensors={sensors}
					collisionDetection={collisionDetection}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
					itemOperations={{
						onUpdate: updateItem,
						onRemove: removeItem,
						onToggleCollapse: toggleLoopCollapse,
						onAddToLoop: addToLoop,
						onDuplicate: duplicateItem,
						onMoveToTop: moveToTop,
						onMoveToBottom: moveToBottom,
						onMoveUp: moveUp,
						onMoveDown: moveDown,
					}}
					editMode={editMode}
					state={state}
					onStart={startTimer}
					onPause={pauseTimer}
					onReset={resetTimer}
					onStop={stopTimer}
					onFastBackward={fastBackward}
					onFastForward={fastForward}
				/>
			)}

			{/* Dialogs */}
			<TimerSettingsDialog
				open={showSettings}
				onOpenChange={setShowSettings}
				timer={
					loadedTimer
						? {
								...loadedTimer,
								category: settings.timerCategory,
								icon: settings.timerIcon,
								color: settings.timerColor,
								colors: settings.timerColors,
								isSpeakNames: settings.timerIsSpeakNames,
								defaultAlarm: settings.timerDefaultAlarm,
								description: settings.timerDescription,
							}
						: null
				}
				workoutItems={config.items}
				onSave={settings.applySettingsFromDialog}
			/>

			<AiPromptDialog
				open={showAiDialog}
				onOpenChange={setShowAiDialog}
				onGenerated={handleAiGenerated}
				currentConfig={config}
				currentName={settings.timerName}
			/>

			<SaveTemplateDialog
				open={showSaveTemplateDialog}
				onOpenChange={setShowSaveTemplateDialog}
				timerName={settings.timerName}
				timerData={config}
			/>

			<ShareDialog
				open={showShareDialog}
				onOpenChange={setShowShareDialog}
				timerName={settings.timerName}
				timerData={config}
				timerDescription={settings.timerDescription}
			/>

			<UserPreferencesDialog
				open={showUserPreferencesDialog}
				onOpenChange={setShowUserPreferencesDialog}
			/>
		</div>
	);
}

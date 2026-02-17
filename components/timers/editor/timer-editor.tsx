"use client";

import { AdvancedTimerEditorPanel } from "@/components/timers/editor/advanced/advanced-timer-editor-panel";
import { UnsavedChangesDialog } from "@/components/timers/editor/advanced/unsaved-changes-dialog";
import { TimerSettingsDialog } from "@/components/timers/editor/timer-settings-dialog";
import { UserPreferencesDialog } from "@/components/timers/editor/user-preferences-dialog";
import dynamic from "next/dynamic";

const AiPromptDialog = dynamic(
	() =>
		import("@/components/timers/editor/ai-prompt-dialog").then((m) => ({
			default: m.AiPromptDialog,
		})),
	{ ssr: false },
);

const SaveTemplateDialog = dynamic(
	() =>
		import("@/components/timers/editor/save-template-dialog").then((m) => ({
			default: m.SaveTemplateDialog,
		})),
	{ ssr: false },
);

const ShareDialog = dynamic(
	() =>
		import("@/components/timers/share/share-dialog").then((m) => ({
			default: m.ShareDialog,
		})),
	{ ssr: false },
);
import { useFlattenedIntervals } from "@/hooks/timers/use-flattened-intervals";
import { useTimerConfigManagement } from "@/hooks/timers/use-timer-config-management";
import { useTimerDragAndDrop } from "@/hooks/timers/use-timer-drag-and-drop";
import { useTimerPersistence } from "@/hooks/timers/use-timer-persistence";
import { useTimerSettings } from "@/hooks/timers/use-timer-settings";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import type {
	AdvancedConfig,
	LoadedTimer,
	WorkoutItem,
} from "@/types/advanced-timer";
import { isLoop } from "@/types/advanced-timer";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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

export interface TimerEditorProps {
	loadedTimer?: LoadedTimer;
	onSaved?: (t: unknown) => void;
	onTimerNameChange?: (name: string) => void;
	onSaveComplete?: () => void;
	onExit?: () => void;
}

export function TimerEditor({
	loadedTimer,
	onSaved,
	onTimerNameChange,
	onSaveComplete,
	onExit,
}: TimerEditorProps) {
	const { data: userPreferences } = useUserPreferences();

	const {
		config,
		setConfig,
		setNextId,
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

	const {
		activeId,
		sensors,
		collisionDetection,
		handleDragStart,
		handleDragEnd,
	} = useTimerDragAndDrop({ config, setConfig });

	const settings = useTimerSettings({
		loadedTimer,
		userPreferences: userPreferences ?? undefined,
		onTimerNameChange,
	});

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

	const flattenedIntervals = useFlattenedIntervals(config.items);
	const totalSessionTime = flattenedIntervals.reduce(
		(sum, interval) => sum + interval.duration,
		0,
	);

	const [showSettings, setShowSettings] = useState(false);
	const [showAiDialog, setShowAiDialog] = useState(false);
	const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
	const [showShareDialog, setShowShareDialog] = useState(false);
	const [showUserPreferencesDialog, setShowUserPreferencesDialog] =
		useState(false);

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

	const noop = useCallback(() => {}, []);

	return (
		<div className="relative">
			<UnsavedChangesDialog
				open={persistence.showConfirmExit}
				onOpenChange={persistence.setShowConfirmExit}
				onDiscard={() => onExit?.()}
				onSaveAndExit={persistence.handleSaveAndExit}
				isPending={persistence.pendingExit}
			/>

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
				editMode
				state="idle"
				onStart={noop}
				onPause={noop}
				onReset={noop}
				onStop={noop}
				onFastBackward={noop}
				onFastForward={noop}
			/>

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

/**
 * Hook for managing timer persistence (save, update) and dirty state tracking.
 */

import { useSaveTimer, useUpdateTimer } from "@/hooks/use-timers";
import type { TemplateCategory } from "@/lib/constants/timers";
import type {
	AdvancedConfig,
	ColorSettings,
	LoadedTimer,
} from "@/types/advanced-timer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface TimerData {
	config: AdvancedConfig;
	timerName: string;
	timerCategory: string;
	timerIcon: string | null;
	timerColor: string | null;
	timerColors: ColorSettings;
	timerIsSpeakNames: boolean;
	timerDefaultAlarm: string;
	timerDescription: string;
}

interface UseTimerPersistenceOptions {
	loadedTimer?: LoadedTimer;
	timerData: TimerData;
	onSaved?: (data: unknown) => void;
	onSaveComplete?: () => void;
	onExit?: () => void;
}

export interface TimerPersistenceResult {
	isDirty: boolean;
	isSavingOrUpdating: boolean;
	showConfirmExit: boolean;
	setShowConfirmExit: React.Dispatch<React.SetStateAction<boolean>>;
	pendingExit: boolean;
	handleSave: () => void;
	handleSaveAndExit: () => void;
	handleBack: () => void;
}

export function useTimerPersistence({
	loadedTimer,
	timerData,
	onSaved,
	onSaveComplete,
	onExit,
}: UseTimerPersistenceOptions): TimerPersistenceResult {
	const { mutate: saveTimer, isPending: isSaving } = useSaveTimer();
	const { mutate: overwriteTimer, isPending: isUpdating } = useUpdateTimer();
	const isSavingOrUpdating = isSaving || isUpdating;

	// Confirmation dialog state
	const [showConfirmExit, setShowConfirmExit] = useState(false);
	const [pendingExit, setPendingExit] = useState(false);

	// Dirty state tracking refs
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
			initialConfigRef.current = timerData.config;
			initialNameRef.current = timerData.timerName;
		}
	}, [loadedTimer, timerData.config, timerData.timerName]);

	// Compute dirty state
	const isDirty = useMemo(() => {
		const initialConfig = initialConfigRef.current;
		const initialName = initialNameRef.current;
		if (!initialConfig) return false;
		const configChanged =
			JSON.stringify(timerData.config) !== JSON.stringify(initialConfig);
		const nameChanged = timerData.timerName !== initialName;
		return configChanged || nameChanged;
	}, [timerData.config, timerData.timerName]);

	// Build the save payload
	const buildSavePayload = useCallback(() => {
		const normalizedCategory = timerData.timerCategory || "custom";
		return {
			name: timerData.timerName.trim() || "New Timer",
			data: timerData.config,
			category: normalizedCategory as TemplateCategory,
			icon: timerData.timerIcon,
			color: timerData.timerColor,
			colors: timerData.timerColors,
			isSpeakNames: timerData.timerIsSpeakNames,
			defaultAlarm: timerData.timerDefaultAlarm,
			description: timerData.timerDescription || null,
		};
	}, [timerData]);

	// Save handler (immediate save without exiting)
	const handleSave = useCallback(() => {
		if (!timerData.timerName.trim()) {
			toast.error("Please provide a name");
			return;
		}

		const payload = buildSavePayload();

		// If editing an existing timer
		if (loadedTimer) {
			overwriteTimer(
				{
					id: loadedTimer.id,
					data: payload,
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
		saveTimer(payload, {
			onSuccess: () => {
				if (onSaved) {
					onSaved(timerData.config);
				}
				onSaveComplete?.();
			},
		});
	}, [
		timerData.timerName,
		timerData.config,
		buildSavePayload,
		loadedTimer,
		overwriteTimer,
		saveTimer,
		onSaved,
		onSaveComplete,
	]);

	// Save and exit handler
	const handleSaveAndExit = useCallback(() => {
		if (!timerData.timerName.trim()) {
			toast.error("Please provide a name", { id: "save-exit-no-name" });
			return;
		}
		setPendingExit(true);

		const onSuccess = () => {
			setPendingExit(false);
			setShowConfirmExit(false);
			onExit?.();
		};

		const payload = buildSavePayload();

		// If editing an existing timer
		if (loadedTimer) {
			overwriteTimer(
				{
					id: loadedTimer.id,
					data: payload,
				},
				{ onSuccess },
			);
			return;
		}

		// Creating a brand-new timer
		saveTimer(payload, { onSuccess });
	}, [
		timerData.timerName,
		buildSavePayload,
		loadedTimer,
		overwriteTimer,
		saveTimer,
		onExit,
	]);

	// Back handler - checks dirty state
	const handleBack = useCallback(() => {
		if (isDirty) {
			setShowConfirmExit(true);
		} else {
			onExit?.();
		}
	}, [isDirty, onExit]);

	return {
		isDirty,
		isSavingOrUpdating,
		showConfirmExit,
		setShowConfirmExit,
		pendingExit,
		handleSave,
		handleSaveAndExit,
		handleBack,
	};
}

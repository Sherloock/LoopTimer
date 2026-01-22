import type { AdvancedConfig } from "@/types/advanced-timer";
import { saveAs } from "file-saver";

export const EXPORT_VERSION = "1.0";

export interface TimerExport {
	version: string;
	exportedAt: string;
	timer: {
		name: string;
		data: AdvancedConfig;
	};
}

export function createTimerExport(
	name: string,
	data: AdvancedConfig,
): TimerExport {
	return {
		version: EXPORT_VERSION,
		exportedAt: new Date().toISOString(),
		timer: {
			name,
			data,
		},
	};
}

export function exportTimerAsJSON(name: string, data: AdvancedConfig): string {
	const exportData = createTimerExport(name, data);
	return JSON.stringify(exportData, null, 2);
}

export function exportTimerAsJSONMinified(
	name: string,
	data: AdvancedConfig,
): string {
	const exportData = createTimerExport(name, data);
	return JSON.stringify(exportData);
}

export function downloadTimerAsJSON(name: string, data: AdvancedConfig): void {
	const jsonString = exportTimerAsJSON(name, data);
	const blob = new Blob([jsonString], { type: "application/json" });
	const filename = `${sanitizeFilename(name)}.json`;
	saveAs(blob, filename);
}

export function copyTimerToClipboard(
	name: string,
	data: AdvancedConfig,
): Promise<void> {
	const jsonString = exportTimerAsJSONMinified(name, data);
	return navigator.clipboard.writeText(jsonString);
}

function sanitizeFilename(filename: string): string {
	return filename
		.replace(/[^a-z0-9]/gi, "_")
		.toLowerCase()
		.substring(0, 50);
}

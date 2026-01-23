import type { ColorSettings } from "@/types/advanced-timer";

export interface ColorScheme {
	name: string;
	label: string;
	colors: ColorSettings;
}

export const COLOR_SCHEMES: ColorScheme[] = [
	{
		name: "default",
		label: "Default",
		colors: {
			prepare: "#f97316", // orange-500
			work: "#22c55e", // green-500
			rest: "#3b82f6", // blue-500
			loop: "#8b5cf6", // violet-500
			nestedLoop: "#f59e0b", // amber-500
		},
	},
	{
		name: "ocean",
		label: "Ocean",
		colors: {
			prepare: "#06b6d4", // cyan-500
			work: "#22c55e", // green-500
			rest: "#3b82f6", // blue-500
			loop: "#8b5cf6", // violet-500
			nestedLoop: "#f59e0b", // amber-500
		},
	},
	{
		name: "forest",
		label: "Forest",
		colors: {
			prepare: "#f97316", // orange-500
			work: "#22c55e", // green-500
			rest: "#14b8a6", // teal-500
			loop: "#059669", // emerald-600
			nestedLoop: "#84cc16", // lime-500
		},
	},
	{
		name: "sunset",
		label: "Sunset",
		colors: {
			prepare: "#f97316", // orange-500
			work: "#ef4444", // red-500
			rest: "#3b82f6", // blue-500
			loop: "#dc2626", // red-600
			nestedLoop: "#fbbf24", // amber-400
		},
	},
	{
		name: "purple",
		label: "Purple",
		colors: {
			prepare: "#a855f7", // purple-500
			work: "#22c55e", // green-500
			rest: "#3b82f6", // blue-500
			loop: "#8b5cf6", // violet-500
			nestedLoop: "#d946ef", // fuchsia-500
		},
	},
];

export function getColorScheme(name: string): ColorScheme | undefined {
	return COLOR_SCHEMES.find((scheme) => scheme.name === name);
}

export function getDefaultColorScheme(): ColorScheme {
	return COLOR_SCHEMES[0]!; // Default scheme
}

// Semantic colors for UI elements (badges, status indicators, etc.)
export const SEMANTIC_COLORS = {
	success: "#10B981", // green-500
	warning: "#F59E0B", // amber-500
	error: "#EF4444", // red-500
	neutral: "#6B7280", // gray-500
} as const;

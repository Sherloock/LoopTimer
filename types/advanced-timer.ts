// Shared types & helpers for Advanced Timer
export interface IntervalStep {
	id: string;
	name: string;
	duration: number;
	type: "prepare" | "work" | "rest";
	color?: string;
	skipOnLastLoop?: boolean;
	sound?: string;
}

export interface LoopGroup {
	id: string;
	loops: number;
	items: WorkoutItem[];
	collapsed?: boolean;
	color?: string;
}

export type WorkoutItem = IntervalStep | LoopGroup;

export interface ColorSettings {
	prepare: string;
	work: string;
	rest: string;
	loop: string;
	nestedLoop: string;
}

export interface AdvancedConfig {
	items: WorkoutItem[];
}

export interface LoadedTimer {
	id: string;
	name: string;
	data: any;
	category?: string | null;
	icon?: string | null;
	color?: string | null;
	colors?: ColorSettings | null;
	isSpeakNames?: boolean | null;
	defaultAlarm?: string | null;
	description?: string | null;
}

export const isLoop = (item: WorkoutItem): item is LoopGroup => {
	return "loops" in item && "items" in item;
};

export const isInterval = (item: WorkoutItem): item is IntervalStep => {
	return "duration" in item && "type" in item;
};

export const getDefaultNameForType = (
	type: "prepare" | "work" | "rest",
): string => {
	switch (type) {
		case "prepare":
			return "PREPARE";
		case "work":
			return "WORK";
		case "rest":
			return "REST";
		default:
			return "INTERVAL";
	}
};

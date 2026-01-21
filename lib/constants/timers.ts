export const TIMER_LIST = {
	SKELETON_COUNT: 3,
	COPY_SUFFIX: " (Copy)",
	SUBTITLE: {
		HAS_TIMERS: "Choose a timer to start.",
		EMPTY: "Turn minutes into momentum. Create your first timer.",
	},
	EMPTY_STATE: {
		TITLE: "No timers yet",
		DESCRIPTION:
			"Create your first timer in seconds — intervals, breaks, and loops included.",
		CTA: "Create your first timer",
	},
} as const;

export const TIMER_NAME_MAX_LENGTH = 100;
// prepare: "#d946ef", // fuchsia-500 (purple-leaning prepare)
// work: "#8b5cf6", // violet-500 (purple-leaning work)
// rest: "#6366f1", // indigo-500 (purple-leaning rest)
// loop: "#a78bfa", // violet-400 (purple-leaning loop)
// nestedLoop: "#c4b5fd", // violet-300 (purple-leaning nested loop)
export const ADVANCED_TIMER_DEFAULT_COLORS = {
	prepare: "#f97316", // orange-500 (orange prepare)
	work: "#22c55e", // green-500 (green work)
	rest: "#3b82f6", // blue-500 (blue rest)
	loop: "#8b5cf6", // violet-500 (purple loop)
	nestedLoop: "#f59e0b", // amber-500 (amber nested loop)
} as const;

export const ADVANCED_TIMER_DEFAULT_NEXT_ID = 6;

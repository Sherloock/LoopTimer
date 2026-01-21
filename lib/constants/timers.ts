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

export const ADVANCED_TIMER_DEFAULT_COLORS = {
	prepare: "#7c3aed", // violet-600
	work: "#8b5cf6", // violet-500
	rest: "#d946ef", // fuchsia-500
	loop: "#c4b5fd", // violet-300
	nestedLoop: "#ddd6fe", // violet-200
} as const;

export const ADVANCED_TIMER_DEFAULT_NEXT_ID = 6;

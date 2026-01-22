export const QUERY_KEYS = {
	TIMERS: ["timers"],
	TEMPLATES: ["templates"],
	TEMPLATE: (id: string) => ["template", id],
	SHARED_TIMER: (id: string) => ["shared-timer", id],
} as const;

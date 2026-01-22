export const ROUTES = {
	HOME: "/",
	SIGN_IN: "/sign-in",
	SIGN_UP: "/sign-up",
	MENU: "/app/menu",
	TIMER_LIST: "/app/timer/list",
	TIMER_EDIT: "/app/timer/edit",
	TIMER_PLAY: "/app/timer/play",
	TIMER_TEMPLATES: "/app/timer/templates",
	TIMER_TEMPLATES_MY: "/app/timer/templates/my",
	SHARED_TIMER: (id: string) => `/shared/${id}`,
	CLOCK: "/app/clock",
} as const;

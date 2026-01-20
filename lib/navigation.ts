"use client";

export { ROUTES } from "@/lib/constants/routes";

import { ROUTES } from "@/lib/constants/routes";
import { useRouter } from "next/navigation";

/**
 * Navigation utility functions for the timer app
 * Centralizes common navigation patterns to avoid repetition
 */

/**
 * Hook for common navigation actions
 * Provides reusable navigation functions
 */
export function useNavigation() {
	const router = useRouter();

	return {
		// Navigate to menu page (previously /app)
		goToMenu: () => router.push(ROUTES.MENU),

		// Navigate to advanced timer page
		goToAdvancedTimer: () => router.push(ROUTES.TIMER_LIST),

		// Navigate to edit timer page with optional timer ID
		goToEditTimer: (timerId?: string) => {
			const url = timerId
				? `${ROUTES.TIMER_EDIT}?id=${timerId}`
				: ROUTES.TIMER_EDIT;
			router.push(url);
		},

		// Navigate to play timer page with optional timer ID
		goToPlayTimer: (timerId?: string) => {
			const url = timerId
				? `${ROUTES.TIMER_PLAY}?id=${timerId}`
				: ROUTES.TIMER_PLAY;
			router.push(url);
		},

		// Navigate to home page
		goToHome: () => router.push(ROUTES.HOME),

		// Go back to previous page
		goBack: () => router.back(),

		// Generic navigation function
		navigate: (path: string) => router.push(path),
	};
}

/**
 * Static navigation functions for use outside of components
 * Useful for server actions or utility functions
 */
export const navigation = {
	getMenuUrl: () => ROUTES.MENU,
	getAdvancedTimerUrl: () => ROUTES.TIMER_LIST,
	getEditTimerUrl: (timerId?: string) =>
		timerId ? `${ROUTES.TIMER_EDIT}?id=${timerId}` : ROUTES.TIMER_EDIT,
	getPlayTimerUrl: (timerId?: string) =>
		timerId ? `${ROUTES.TIMER_PLAY}?id=${timerId}` : ROUTES.TIMER_PLAY,
	getHomeUrl: () => ROUTES.HOME,
};

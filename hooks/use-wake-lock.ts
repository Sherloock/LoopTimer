import { useEffect, useRef } from "react";
import { toast } from "sonner";

// Extend the Window interface to allow our session flag
declare global {
	interface Window {
		__wakeLockToastShown?: boolean;
	}
}

/**
 * useWakeLock - Prevents the device screen from dimming/sleeping while enabled is true.
 * Uses the Screen Wake Lock API (https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API).
 * Falls back gracefully if not supported and shows a toast to the user.
 *
 * @param enabled - Whether to keep the screen awake
 */
export function useWakeLock(enabled: boolean) {
	const wakeLockRef = useRef<WakeLockSentinel | null>(null);

	useEffect(() => {
		let isActive = true;

		// Only show the unsupported toast once per session
		const showUnsupportedToast = () => {
			if (!window.__wakeLockToastShown) {
				window.__wakeLockToastShown = true;
				toast.info(
					"Screen Wake Lock is not supported on your device/browser. Your screen may dim or lock during the timer. <a href='https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API' target='_blank' rel='noopener noreferrer' class='underline'>Learn more</a>",
					{ id: "wake-lock-unsupported", duration: 9000 },
				);
			}
		};

		async function requestWakeLock() {
			if (
				enabled &&
				"wakeLock" in navigator &&
				typeof (navigator as any).wakeLock.request === "function"
			) {
				try {
					// @ts-ignore: Wake Lock API is not yet in TypeScript lib
					const wakeLock = await (navigator as any).wakeLock.request("screen");
					if (!isActive) {
						// If the effect was cleaned up before the lock was acquired
						await wakeLock.release();
						return;
					}
					wakeLockRef.current = wakeLock;
					// Auto-release on visibility change (browser tab switch)
					wakeLock.addEventListener("release", () => {
						wakeLockRef.current = null;
					});
				} catch (err) {
					// Could not acquire wake lock (e.g., permission denied)
					// Optionally, show a toast or log
				}
			} else if (enabled) {
				// Wake Lock API not supported
				showUnsupportedToast();
			}
		}

		if (enabled) {
			requestWakeLock();
		} else if (wakeLockRef.current) {
			wakeLockRef.current.release();
			wakeLockRef.current = null;
		}

		// Release on unmount or when disabled
		return () => {
			isActive = false;
			if (wakeLockRef.current) {
				wakeLockRef.current.release();
				wakeLockRef.current = null;
			}
		};
	}, [enabled]);
}

import { useEffect, useRef } from "react";
import { toast } from "sonner";

// Extend the Window interface to allow our session flag
declare global {
	interface Window {
		__wakeLockToastShown?: boolean;
		__iosWakeLockVideo?: HTMLVideoElement | null;
	}
}

/**
 * iOS Safari doesn't support the Wake Lock API well.
 * This workaround plays a hidden video to keep the screen awake.
 */
function enableIOSWakeLock() {
	if (typeof window === "undefined") return;

	// Check if it's iOS
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
	if (!isIOS) return;

	// Create a hidden video element if not exists
	if (!window.__iosWakeLockVideo) {
		const video = document.createElement("video");
		video.setAttribute("playsinline", "");
		video.setAttribute("muted", "");
		video.setAttribute("loop", "");
		video.style.position = "absolute";
		video.style.opacity = "0";
		video.style.pointerEvents = "none";
		video.style.width = "1px";
		video.style.height = "1px";

		// Use a tiny blank video data URI
		video.src =
			"data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAgRtZGF0AAAAAA==";

		document.body.appendChild(video);
		window.__iosWakeLockVideo = video;
	}

	// Try to play the video
	const playVideo = () => {
		window.__iosWakeLockVideo?.play().catch(() => {
			// Auto-play was prevented, will retry on user interaction
		});
	};

	playVideo();

	// Also try on user interaction in case auto-play was blocked
	document.addEventListener("touchstart", playVideo, { once: true });
	document.addEventListener("click", playVideo, { once: true });
}

function disableIOSWakeLock() {
	if (window.__iosWakeLockVideo) {
		window.__iosWakeLockVideo.pause();
		window.__iosWakeLockVideo.remove();
		window.__iosWakeLockVideo = null;
	}
}

/**
 * useWakeLock - Prevents the device screen from dimming/sleeping while enabled is true.
 * Uses the Screen Wake Lock API (https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API).
 * Falls back to iOS workaround for Safari. Shows toast if not supported.
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
					"Screen wake lock not supported. Tap the screen to keep it awake during workout.",
					{ id: "wake-lock-unsupported", duration: 5000 },
				);
			}
		};

		async function requestWakeLock() {
			// Try native Wake Lock API first
			if (
				"wakeLock" in navigator &&
				typeof (navigator as any).wakeLock?.request === "function"
			) {
				try {
					// @ts-ignore: Wake Lock API is not yet in TypeScript lib
					const wakeLock = await (navigator as any).wakeLock.request("screen");
					if (!isActive) {
						await wakeLock.release();
						return;
					}
					wakeLockRef.current = wakeLock;

					wakeLock.addEventListener("release", () => {
						wakeLockRef.current = null;
						// Re-acquire if still enabled and visible
						if (enabled && document.visibilityState === "visible") {
							requestWakeLock();
						}
					});
				} catch (err) {
					// Fall through to iOS workaround
					enableIOSWakeLock();
				}
			} else {
				// No native support - try iOS workaround
				const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
				if (isIOS) {
					enableIOSWakeLock();
				} else {
					showUnsupportedToast();
				}
			}
		}

		if (enabled) {
			requestWakeLock();
		} else {
			if (wakeLockRef.current) {
				wakeLockRef.current.release();
				wakeLockRef.current = null;
			}
			disableIOSWakeLock();
		}

		// Handle visibility change (wake lock is released when tab is hidden)
		const handleVisibilityChange = () => {
			if (enabled && document.visibilityState === "visible") {
				requestWakeLock();
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			isActive = false;
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			if (wakeLockRef.current) {
				wakeLockRef.current.release();
				wakeLockRef.current = null;
			}
			disableIOSWakeLock();
		};
	}, [enabled]);
}

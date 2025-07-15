/*
 * Sound utilities based on the Web Audio API
 * Generates short notification tones on-the-fly, so we don't need bundled mp3s.
 */

export const SOUND_OPTIONS = [
	// None option
	{ label: "None", value: "none" },
	// Beep variants
	{ label: "Beep (short)", value: "beep-short" },
	{ label: "Beep ×1", value: "beep-1x" },
	{ label: "Beep ×2", value: "beep-2x" },
	{ label: "Beep ×3", value: "beep-3x" },
	// Bell variants
	{ label: "Bell (short)", value: "bell-short" },
	{ label: "Bell ×1", value: "bell-1x" },
	{ label: "Bell ×2", value: "bell-2x" },
	{ label: "Bell ×3", value: "bell-3x" },
	// Gong variants
	{ label: "Gong (short)", value: "gong-short" },
	{ label: "Gong ×1", value: "gong-1x" },
	{ label: "Gong ×2", value: "gong-2x" },
	{ label: "Gong ×3", value: "gong-3x" },
	// Whistle / Shriek variants
	{ label: "Whistle (short)", value: "whistle-short" },
	{ label: "Whistle ×1", value: "whistle-1x" },
	{ label: "Whistle ×2", value: "whistle-2x" },
	{ label: "Whistle ×3", value: "whistle-3x" },
] as const;

type SoundKey = (typeof SOUND_OPTIONS)[number]["value"];

// Global mute state
let isMuted = false;

export const setMute = (muted: boolean) => {
	isMuted = muted;
};

export const getMute = () => isMuted;

/* Keep a single, lazily-created AudioContext to avoid expensive re-creation */
const getCtx = () => {
	const g = globalThis as any;
	if (!g.__timer_audio_ctx) {
		// @ts-ignore
		g.__timer_audio_ctx = new (window.AudioContext ||
			(window as any).webkitAudioContext)();
	}
	return g.__timer_audio_ctx as AudioContext;
};

const playTone = (
	frequency: number,
	durationMs: number,
	{
		type = "sine",
		volume = 0.2,
		attack = 0.01,
		decay = 0.05,
	}: {
		type?: OscillatorType;
		volume?: number;
		attack?: number;
		decay?: number;
	} = {},
) => {
	try {
		const ctx = getCtx();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = type;
		osc.frequency.value = frequency;

		// Use the provided volume directly
		const finalVolume = typeof volume === "number" ? volume : 0.2;

		gain.gain.setValueAtTime(0, ctx.currentTime);
		gain.gain.linearRampToValueAtTime(finalVolume, ctx.currentTime + attack);
		gain.gain.linearRampToValueAtTime(
			0,
			ctx.currentTime + durationMs / 1000 - decay,
		);

		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + durationMs / 1000);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.warn("WebAudio playback failed", err);
	}
};

// Improved beep with softer frequency and smoother waveform
const playBeep = (duration = 300) => {
	const ctx = getCtx();
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();

	// Use a more pleasant frequency for beeps
	osc.type = "sine";
	osc.frequency.setValueAtTime(750, ctx.currentTime);

	// Create a more natural beep envelope
	const now = ctx.currentTime;
	const volume = 0.2;

	gain.gain.setValueAtTime(0, now);
	gain.gain.linearRampToValueAtTime(volume, now + 0.05); // Gentle attack
	gain.gain.setValueAtTime(volume, now + (duration / 1000) * 0.7); // Hold
	gain.gain.linearRampToValueAtTime(0, now + duration / 1000); // Gentle decay

	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start();
	osc.stop(now + duration / 1000);
};

const playBeepShort = () => {
	const ctx = getCtx();
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();

	osc.type = "sine";
	osc.frequency.setValueAtTime(800, ctx.currentTime);

	const now = ctx.currentTime;
	const volume = 0.18;

	gain.gain.setValueAtTime(0, now);
	gain.gain.linearRampToValueAtTime(volume, now + 0.03); // Quick but gentle attack
	gain.gain.setValueAtTime(volume, now + 0.05); // Hold
	gain.gain.linearRampToValueAtTime(0, now + 0.15); // Gentle decay

	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start();
	osc.stop(now + 0.15);
};

const playBell = () => {
	// Create a more authentic bell sound with harmonics and resonance
	const ctx = getCtx();

	// Create multiple oscillators for bell harmonics
	const osc1 = ctx.createOscillator(); // Fundamental
	const osc2 = ctx.createOscillator(); // Harmonic 1
	const osc3 = ctx.createOscillator(); // Harmonic 2
	const gain1 = ctx.createGain();
	const gain2 = ctx.createGain();
	const gain3 = ctx.createGain();

	// Bell-like frequency relationships (typical bell harmonics)
	const fundamental = 800;
	const harmonic1 = fundamental * 2.2; // Major third
	const harmonic2 = fundamental * 3.0; // Perfect fifth

	// Set up fundamental tone
	osc1.type = "sine";
	osc1.frequency.setValueAtTime(fundamental, ctx.currentTime);
	osc1.frequency.exponentialRampToValueAtTime(
		fundamental * 0.95,
		ctx.currentTime + 0.8,
	);

	// Set up harmonics
	osc2.type = "sine";
	osc2.frequency.setValueAtTime(harmonic1, ctx.currentTime);
	osc2.frequency.exponentialRampToValueAtTime(
		harmonic1 * 0.97,
		ctx.currentTime + 0.8,
	);

	osc3.type = "sine";
	osc3.frequency.setValueAtTime(harmonic2, ctx.currentTime);
	osc3.frequency.exponentialRampToValueAtTime(
		harmonic2 * 0.98,
		ctx.currentTime + 0.8,
	);

	// Bell-like envelope with quick attack and long decay
	const now = ctx.currentTime;

	// Fundamental envelope
	const volume1 = 0.4;
	gain1.gain.setValueAtTime(0, now);
	gain1.gain.linearRampToValueAtTime(volume1, now + 0.02); // Quick attack
	gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2); // Long decay

	// Harmonic envelopes (slightly different timing for richness)
	const volume2 = 0.15;
	gain2.gain.setValueAtTime(0, now);
	gain2.gain.linearRampToValueAtTime(volume2, now + 0.01);
	gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

	const volume3 = 0.1;
	gain3.gain.setValueAtTime(0, now);
	gain3.gain.linearRampToValueAtTime(volume3, now + 0.03);
	gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

	// Connect oscillators to gains
	osc1.connect(gain1);
	osc2.connect(gain2);
	osc3.connect(gain3);

	// Connect gains to destination
	gain1.connect(ctx.destination);
	gain2.connect(ctx.destination);
	gain3.connect(ctx.destination);

	// Start and stop oscillators
	osc1.start();
	osc2.start();
	osc3.start();

	osc1.stop(now + 1.2);
	osc2.stop(now + 1.0);
	osc3.stop(now + 1.4);
};

const playBellShort = () => {
	// Shorter version of the bell sound
	const ctx = getCtx();

	const osc1 = ctx.createOscillator();
	const osc2 = ctx.createOscillator();
	const gain1 = ctx.createGain();
	const gain2 = ctx.createGain();

	const fundamental = 1000;
	const harmonic = fundamental * 2.2;

	osc1.type = "sine";
	osc1.frequency.setValueAtTime(fundamental, ctx.currentTime);

	osc2.type = "sine";
	osc2.frequency.setValueAtTime(harmonic, ctx.currentTime);

	const now = ctx.currentTime;

	// Apply volume to both gain nodes
	const volume1 = 0.3;
	gain1.gain.setValueAtTime(0, now);
	gain1.gain.linearRampToValueAtTime(volume1, now + 0.01);
	gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

	const volume2 = 0.1;
	gain2.gain.setValueAtTime(0, now);
	gain2.gain.linearRampToValueAtTime(volume2, now + 0.01);
	gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

	osc1.connect(gain1);
	osc2.connect(gain2);
	gain1.connect(ctx.destination);
	gain2.connect(ctx.destination);

	osc1.start();
	osc2.start();
	osc1.stop(now + 0.4);
	osc2.stop(now + 0.4);
};

const playBellPattern = (count: number) => {
	for (let i = 0; i < count; i++) {
		setTimeout(() => playBell(), i * 600);
	}
};

const playBeepPattern = (count: number) => {
	for (let i = 0; i < count; i++) {
		setTimeout(() => playBeep(), i * 300);
	}
};

const playGong = (duration = 800) =>
	playTone(200, duration, {
		type: "sine",
		volume: 0.4,
		attack: 0.02,
		decay: 0.1,
	});

const playGongPattern = (count: number) => {
	for (let i = 0; i < count; i++) {
		setTimeout(() => playGong(), i * 900);
	}
};

// Improved whistle with lower frequency and softer volume
const playWhistle = (duration = 500) =>
	playTone(1200, duration, {
		type: "sine",
		volume: 0.18,
		attack: 0.02,
		decay: 0.25,
	});

const playWhistlePattern = (count: number) => {
	for (let i = 0; i < count; i++) {
		setTimeout(() => playWhistle(), i * 600);
	}
};

export const playSound = (soundKey?: string) => {
	// Check if sound is muted or if "none" is selected
	if (!soundKey || soundKey === "none" || isMuted) return;

	const key = soundKey as SoundKey;

	const [category, variant] = key.split("-") as [string, string | undefined];

	try {
		switch (category) {
			case "beep": {
				if (variant === "short") playBeepShort();
				else if (variant === "1x") playBeep();
				else if (variant === "2x") playBeepPattern(2);
				else if (variant === "3x") playBeepPattern(3);
				else playBeep();
				break;
			}
			case "bell": {
				if (variant === "short") playBellShort();
				else if (variant === "1x") playBell();
				else if (variant === "2x") playBellPattern(2);
				else if (variant === "3x") playBellPattern(3);
				else playBell();
				break;
			}
			case "gong": {
				if (variant === "short") playGong(500);
				else if (variant === "1x") playGong();
				else if (variant === "2x") playGongPattern(2);
				else if (variant === "3x") playGongPattern(3);
				else playGong();
				break;
			}
			case "whistle": {
				if (variant === "short") playWhistle(300);
				else if (variant === "1x") playWhistle();
				else if (variant === "2x") playWhistlePattern(2);
				else if (variant === "3x") playWhistlePattern(3);
				else playWhistle();
				break;
			}
			default:
				playBeep();
		}
	} catch (err) {
		// eslint-disable-next-line no-console
		console.warn("Failed to play generated sound", err);
	}
};

// ====================== Speech Utils ======================

// Track if we've had user interaction (required for mobile speech)
let hasUserInteracted = false;

// Initialize user interaction tracking on first load
if (typeof window !== "undefined") {
	const initUserInteraction = () => {
		hasUserInteracted = true;
		// Remove listeners after first interaction
		document.removeEventListener("touchstart", initUserInteraction);
		document.removeEventListener("click", initUserInteraction);
		document.removeEventListener("keydown", initUserInteraction);
	};

	document.addEventListener("touchstart", initUserInteraction, { once: true });
	document.addEventListener("click", initUserInteraction, { once: true });
	document.addEventListener("keydown", initUserInteraction, { once: true });
}

// Wait for voices to be loaded (especially important on mobile)
const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
	return new Promise((resolve) => {
		const voices = window.speechSynthesis.getVoices();
		if (voices.length > 0) {
			resolve(voices);
			return;
		}

		// Wait for voices to load
		const onVoicesChanged = () => {
			const loadedVoices = window.speechSynthesis.getVoices();
			if (loadedVoices.length > 0) {
				window.speechSynthesis.removeEventListener(
					"voiceschanged",
					onVoicesChanged,
				);
				resolve(loadedVoices);
			}
		};

		window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);

		// Fallback timeout
		setTimeout(() => {
			window.speechSynthesis.removeEventListener(
				"voiceschanged",
				onVoicesChanged,
			);
			resolve(window.speechSynthesis.getVoices());
		}, 2000);
	});
};

// Helper function to find the best English voice
const findBestEnglishVoice = (
	voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null => {
	// Detect if we're on Android
	const isAndroid = /Android/.test(navigator.userAgent);

	// Blacklist of known terrible voices (especially on Android)
	const terribleVoices = [
		"Google UK English Female",
		"Google UK English Male",
		"Google US English Female",
		"Google US English Male",
		"eSpeak",
		"Microsoft David",
		"Microsoft Zira",
		"SpeechSynthesis",
	];

	// Filter out terrible voices
	const decentVoices = voices.filter(
		(voice) =>
			!terribleVoices.some((terrible) => voice.name.includes(terrible)),
	);

	// Android-specific voice preferences (prioritize Samsung, LG, system voices)
	if (isAndroid) {
		const androidPreferences = [
			// Samsung voices (usually much better quality)
			(v: SpeechSynthesisVoice) =>
				v.name.includes("Samsung") && v.lang.startsWith("en"),

			// LG voices
			(v: SpeechSynthesisVoice) =>
				v.name.includes("LG") && v.lang.startsWith("en"),

			// Any manufacturer-specific voices
			(v: SpeechSynthesisVoice) =>
				(v.name.includes("HTC") ||
					v.name.includes("Sony") ||
					v.name.includes("Huawei")) &&
				v.lang.startsWith("en"),

			// Local service voices that aren't Google
			(v: SpeechSynthesisVoice) =>
				v.localService && v.lang.startsWith("en") && !v.name.includes("Google"),

			// Pico TTS (better than Google on some devices)
			(v: SpeechSynthesisVoice) =>
				v.name.includes("Pico") && v.lang.startsWith("en"),

			// Any remaining English voices as last resort
			(v: SpeechSynthesisVoice) => v.lang.startsWith("en"),
		];

		for (const preference of androidPreferences) {
			const voice = decentVoices.find(preference);
			if (voice) {
				return voice;
			}
		}
	}

	// Desktop/iOS preferences (original logic)
	const voicePreferences = [
		// High quality system voices (usually best quality)
		(v: SpeechSynthesisVoice) =>
			v.localService &&
			v.lang === "en-US" &&
			(v.name.includes("Enhanced") || v.name.includes("Premium")),
		(v: SpeechSynthesisVoice) =>
			v.localService &&
			v.lang === "en-GB" &&
			(v.name.includes("Enhanced") || v.name.includes("Premium")),

		// System voices with specific quality indicators
		(v: SpeechSynthesisVoice) =>
			v.localService &&
			v.lang === "en-US" &&
			(v.name.includes("Siri") ||
				v.name.includes("Alex") ||
				v.name.includes("Samantha")),
		(v: SpeechSynthesisVoice) =>
			v.localService &&
			v.lang === "en-GB" &&
			(v.name.includes("Daniel") || v.name.includes("Kate")),

		// Any high-quality local English voices
		(v: SpeechSynthesisVoice) =>
			v.localService && v.lang.startsWith("en-") && !v.name.includes("Google"),

		// Default system voices
		(v: SpeechSynthesisVoice) => v.default && v.lang.startsWith("en-"),

		// Any local English voice
		(v: SpeechSynthesisVoice) => v.localService && v.lang.startsWith("en"),

		// Fallback to any English voice
		(v: SpeechSynthesisVoice) => v.lang.startsWith("en-"),
	];

	for (const preference of voicePreferences) {
		const voice = decentVoices.find(preference);
		if (voice) {
			return voice;
		}
	}

	// Ultimate fallback (but still avoid terrible voices if possible)
	return decentVoices.find((v) => v.lang.includes("en")) || voices[0] || null;
};

export const speakText = async (text?: string) => {
	if (!text || isMuted) return;

	// Device detection (declare once at the top)
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
	const isAndroid = /Android/.test(navigator.userAgent);

	try {
		// Check if speech synthesis is available
		if (typeof window === "undefined" || !("speechSynthesis" in window)) {
			console.warn("Speech synthesis not available");
			return;
		}

		// Check for user interaction (required on mobile)
		if (!hasUserInteracted) {
			console.warn("Speech requires user interaction on mobile devices");
			return;
		}

		// Cancel any ongoing speech
		window.speechSynthesis.cancel();

		// Wait a bit for the cancel to take effect
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Wait for voices to be available (important on mobile)
		const voices = await waitForVoices();

		const utterance = new SpeechSynthesisUtterance(text);

		// Configure utterance for clear speech
		utterance.rate = 0.9; // Slightly slower for better clarity
		utterance.pitch = 1.0;
		utterance.volume = 1.0;
		utterance.lang = "en-US"; // Explicitly set language

		// Find the best English voice
		const bestVoice = findBestEnglishVoice(voices);
		if (bestVoice) {
			utterance.voice = bestVoice;
			utterance.lang = bestVoice.lang; // Use the voice's specific language
		}

		// Android-specific adjustments to make it sound less terrible
		if (isAndroid) {
			utterance.rate = 0.75; // Much slower on Android - helps reduce robotic sound
			utterance.pitch = 0.85; // Lower pitch - less shrill/whiny
			utterance.volume = 0.9; // Slightly quieter to reduce harshness
		}

		// Add error handling for utterance
		utterance.onerror = (event) => {
			console.warn("Speech synthesis error:", event.error);
		};

		// Enhanced mobile compatibility
		if (isIOS) {
			// iOS requires immediate speech start
			window.speechSynthesis.speak(utterance);
		} else if (isAndroid) {
			// Android sometimes needs a small delay
			setTimeout(() => {
				window.speechSynthesis.speak(utterance);
			}, 100);
		} else {
			// Desktop browsers
			setTimeout(() => {
				window.speechSynthesis.speak(utterance);
			}, 50);
		}
	} catch (err) {
		// eslint-disable-next-line no-console
		console.warn("Speech synthesis failed", err);
	}
};

// Helper function to test if speech is available and ready
export const isSpeechAvailable = (): boolean => {
	if (typeof window === "undefined" || !("speechSynthesis" in window)) {
		return false;
	}

	return hasUserInteracted;
};

// Helper function to manually trigger user interaction (can be called from components)
export const triggerSpeechInteraction = () => {
	hasUserInteracted = true;
};

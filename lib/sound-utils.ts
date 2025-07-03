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
// Global volume state (0.0 to 1.0)
let globalVolume = 1;

export const setMute = (muted: boolean) => {
	isMuted = muted;
};

export const getMute = () => isMuted;

export const setVolume = (volume: number) => {
	globalVolume = Math.max(0, Math.min(1, volume));
};

export const getVolume = () => globalVolume;

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

		// Apply global volume
		const finalVolume =
			(typeof volume === "number" ? volume : 0.2) * globalVolume;

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

	// Create a more natural beep envelope with global volume applied
	const now = ctx.currentTime;
	const baseVolume = 0.2;
	const finalVolume = baseVolume * globalVolume;

	gain.gain.setValueAtTime(0, now);
	gain.gain.linearRampToValueAtTime(finalVolume, now + 0.05); // Gentle attack
	gain.gain.setValueAtTime(finalVolume, now + (duration / 1000) * 0.7); // Hold
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
	const baseVolume = 0.18;
	const finalVolume = baseVolume * globalVolume;

	gain.gain.setValueAtTime(0, now);
	gain.gain.linearRampToValueAtTime(finalVolume, now + 0.03); // Quick but gentle attack
	gain.gain.setValueAtTime(finalVolume, now + 0.05); // Hold
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

	// Fundamental envelope with global volume applied
	const baseVolume1 = 0.4;
	const finalVolume1 = baseVolume1 * globalVolume;
	gain1.gain.setValueAtTime(0, now);
	gain1.gain.linearRampToValueAtTime(finalVolume1, now + 0.02); // Quick attack
	gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2); // Long decay

	// Harmonic envelopes (slightly different timing for richness) with global volume applied
	const baseVolume2 = 0.15;
	const finalVolume2 = baseVolume2 * globalVolume;
	gain2.gain.setValueAtTime(0, now);
	gain2.gain.linearRampToValueAtTime(finalVolume2, now + 0.01);
	gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

	const baseVolume3 = 0.1;
	const finalVolume3 = baseVolume3 * globalVolume;
	gain3.gain.setValueAtTime(0, now);
	gain3.gain.linearRampToValueAtTime(finalVolume3, now + 0.03);
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

	// Apply global volume to both gain nodes
	const baseVolume1 = 0.3;
	const finalVolume1 = baseVolume1 * globalVolume;
	gain1.gain.setValueAtTime(0, now);
	gain1.gain.linearRampToValueAtTime(finalVolume1, now + 0.01);
	gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

	const baseVolume2 = 0.1;
	const finalVolume2 = baseVolume2 * globalVolume;
	gain2.gain.setValueAtTime(0, now);
	gain2.gain.linearRampToValueAtTime(finalVolume2, now + 0.01);
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
	// Check if sound is muted, volume is 0, or if "none" is selected
	if (!soundKey || soundKey === "none" || isMuted || globalVolume === 0) return;

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
export const speakText = (text?: string) => {
	if (!text || isMuted) return;

	try {
		if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
		const utter = new SpeechSynthesisUtterance(text);

		window.speechSynthesis.cancel(); // stop previous utterances
		window.speechSynthesis.speak(utter);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.warn("Speech synthesis failed", err);
	}
};

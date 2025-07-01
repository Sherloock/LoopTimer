/*
 * Sound utilities based on the Web Audio API
 * Generates short notification tones on-the-fly, so we don't need bundled mp3s.
 */

export const SOUND_OPTIONS = [
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

		gain.gain.setValueAtTime(0, ctx.currentTime);
		gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack);
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

const playBeep = (duration = 150) =>
	playTone(1000, duration, { type: "square" });

const playBeepShort = () => playTone(1000, 80, { type: "square" });

const playBell = () => {
	// Quick bell-like ping: start high freq then drop with decay
	const ctx = getCtx();
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();

	osc.type = "sine";
	osc.frequency.setValueAtTime(1500, ctx.currentTime);
	osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.3);

	gain.gain.setValueAtTime(0.0001, ctx.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
	gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start();
	osc.stop(ctx.currentTime + 0.8);
};

const playBellShort = () => playTone(1500, 300, { type: "sine", volume: 0.3 });

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

const playWhistle = (duration = 500) =>
	playTone(2000, duration, {
		type: "sine",
		volume: 0.25,
		attack: 0.01,
		decay: 0.2,
	});

const playWhistlePattern = (count: number) => {
	for (let i = 0; i < count; i++) {
		setTimeout(() => playWhistle(), i * 600);
	}
};

export const playSound = (soundKey?: string) => {
	if (!soundKey) return;
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
	if (!text) return;
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

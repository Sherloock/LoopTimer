import {
	getMute,
	setMute,
	SOUND_OPTIONS,
	stopAllSounds,
	stopSpeech,
} from "@/lib/sound-utils";

describe("sound-utils", () => {
	beforeEach(() => {
		setMute(false);
	});

	describe("SOUND_OPTIONS", () => {
		it("includes None and beep/bell/gong/whistle variants", () => {
			expect(SOUND_OPTIONS.length).toBeGreaterThan(1);
			expect(SOUND_OPTIONS[0].value).toBe("none");
			expect(SOUND_OPTIONS.some((o) => o.value.startsWith("beep"))).toBe(true);
		});
	});

	describe("setMute / getMute", () => {
		it("getMute returns current mute state", () => {
			expect(getMute()).toBe(false);
			setMute(true);
			expect(getMute()).toBe(true);
			setMute(false);
			expect(getMute()).toBe(false);
		});
	});

	describe("stopAllSounds", () => {
		it("does not throw", () => {
			expect(() => stopAllSounds()).not.toThrow();
		});
	});

	describe("stopSpeech", () => {
		it("does not throw", () => {
			expect(() => stopSpeech()).not.toThrow();
		});
	});
});

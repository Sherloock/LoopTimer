import {
	clearItemLevelColors,
	mergeUserPreferences,
	stripColorsAndSounds,
} from "@/lib/workout-processing";
import type { AdvancedConfig, WorkoutItem } from "@/types/advanced-timer";

const intervalWithColor = (
	id: string,
	name: string,
	duration: number,
): WorkoutItem => ({
	id,
	name,
	duration,
	type: "work",
	color: "#ff0000",
	sound: "beep",
});

const loopWithColor = (id: string, items: WorkoutItem[]): WorkoutItem => ({
	id,
	loops: 2,
	items,
	collapsed: false,
	color: "#00ff00",
});

describe("workout-processing", () => {
	describe("stripColorsAndSounds", () => {
		it("removes color and sound from intervals", () => {
			const config: AdvancedConfig = {
				items: [
					intervalWithColor("i1", "Work", 30) as any,
					{ id: "i2", name: "Rest", duration: 10, type: "rest" },
				],
			};
			const result = stripColorsAndSounds(config);
			expect(result.items).toHaveLength(2);
			expect(result.items[0]).not.toHaveProperty("color");
			expect(result.items[0]).not.toHaveProperty("sound");
			expect((result.items[0] as any).name).toBe("Work");
		});

		it("strips nested loops and keeps structure", () => {
			const config: AdvancedConfig = {
				items: [
					loopWithColor("L1", [intervalWithColor("i1", "A", 30) as any]) as any,
				],
			};
			const result = stripColorsAndSounds(config);
			expect(result.items[0]).toHaveProperty("items");
			expect((result.items[0] as any).items[0]).not.toHaveProperty("color");
		});
	});

	describe("mergeUserPreferences", () => {
		it("returns config with same items (deprecated path)", () => {
			const config = {
				items: [{ id: "i1", name: "W", duration: 30, type: "work" as const }],
			};
			const prefs = {
				colors: {} as any,
				defaultAlarm: "none",
				isSound: false,
				isSpeakNames: false,
			};
			const result = mergeUserPreferences(config, prefs);
			expect(result.items).toEqual(config.items);
		});
	});

	describe("clearItemLevelColors", () => {
		it("removes color from intervals and loops", () => {
			const items: WorkoutItem[] = [
				intervalWithColor("i1", "Work", 30) as any,
				loopWithColor("L1", [intervalWithColor("i2", "A", 20) as any]) as any,
			];
			const result = clearItemLevelColors(items);
			expect(result[0]).not.toHaveProperty("color");
			expect(result[1] as any).not.toHaveProperty("color");
			expect((result[1] as any).items[0]).not.toHaveProperty("color");
		});
	});
});

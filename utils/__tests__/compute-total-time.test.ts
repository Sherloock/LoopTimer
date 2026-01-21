import { computeTotalTime, type WorkoutItem } from "@/utils/compute-total-time";

describe("computeTotalTime", () => {
	it("returns 0 for empty input", () => {
		expect(computeTotalTime([])).toBe(0);
	});

	it("sums interval durations", () => {
		const items: WorkoutItem[] = [
			{ id: "1", name: "PREPARE", duration: 5, type: "prepare" },
			{ id: "2", name: "WORK", duration: 30, type: "work" },
			{ id: "3", name: "REST", duration: 10, type: "rest" },
		];

		expect(computeTotalTime(items)).toBe(45);
	});

	it("multiplies nested items inside loops", () => {
		const items: WorkoutItem[] = [
			{
				id: "loop-1",
				loops: 3,
				items: [
					{ id: "work", name: "WORK", duration: 20, type: "work" },
					{ id: "rest", name: "REST", duration: 10, type: "rest" },
				],
			},
		];

		expect(computeTotalTime(items)).toBe((20 + 10) * 3);
	});

	it("supports loop nesting", () => {
		const items: WorkoutItem[] = [
			{
				id: "outer",
				loops: 2,
				items: [
					{ id: "prepare", name: "PREP", duration: 5, type: "prepare" },
					{
						id: "inner",
						loops: 3,
						items: [{ id: "work", name: "WORK", duration: 10, type: "work" }],
					},
				],
			},
		];

		// outer loops 2x of: prepare(5) + inner loops 3x work(10)
		expect(computeTotalTime(items)).toBe(2 * (5 + 3 * 10));
	});
});

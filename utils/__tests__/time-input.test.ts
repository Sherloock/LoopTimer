import { formatTimeInput, parseTimeInput } from "@/utils/time-input";

describe("time-input", () => {
	describe("parseTimeInput", () => {
		it("parses mm:ss format", () => {
			expect(parseTimeInput("0:00")).toBe(0);
			expect(parseTimeInput("1:30")).toBe(90);
			expect(parseTimeInput("10:05")).toBe(605);
		});

		it("returns 0 or fallback for invalid mm:ss", () => {
			// ":30" → digits "30" → 2 digits → seconds 30
			expect(parseTimeInput(":30")).toBe(30);
			expect(parseTimeInput("ab:cd")).toBe(0);
		});

		it("parses MMSS when 3+ digits (minutes from start, seconds from end)", () => {
			expect(parseTimeInput("130")).toBe(90); // 1:30
			expect(parseTimeInput("005")).toBe(5);
			expect(parseTimeInput("100")).toBe(60); // 1:00
		});

		it("treats 1-2 digits as seconds", () => {
			expect(parseTimeInput("5")).toBe(5);
			expect(parseTimeInput("45")).toBe(45);
			expect(parseTimeInput("0")).toBe(0);
		});

		it("strips non-digits; negative becomes positive digits only", () => {
			// "1a2b3" → digits "123" → 3+ digits → MMSS 1:23 = 83s
			expect(parseTimeInput("1a2b3")).toBe(83);
			// "-5" → digits "5" → 1 digit → 5 seconds
			expect(parseTimeInput("-5")).toBe(5);
		});
	});

	describe("formatTimeInput", () => {
		it("formats seconds as mm:ss", () => {
			expect(formatTimeInput(0)).toBe("00:00");
			expect(formatTimeInput(65)).toBe("01:05");
			expect(formatTimeInput(3661)).toBe("61:01");
		});
	});
});

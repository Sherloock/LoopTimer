import {
	getDefaultPreferences,
	getUserPreferences,
	updateUserPreferences,
} from "@/actions/user/preferences";

const mockCheckAuth = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpsert = jest.fn();

jest.mock("@/actions/auth/authCheck", () => ({
	checkAuth: () => mockCheckAuth(),
}));

jest.mock("@/prisma", () => ({
	db: {
		userPreferences: {
			findUnique: (...args: unknown[]) => mockFindUnique(...args),
			create: (...args: unknown[]) => mockCreate(...args),
			upsert: (...args: unknown[]) => mockUpsert(...args),
		},
	},
}));

describe("preferences actions", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getDefaultPreferences", () => {
		it("returns default preferences structure", async () => {
			const result = await getDefaultPreferences();
			expect(result).toHaveProperty("colors");
			expect(result).toHaveProperty("defaultAlarm");
			expect(result).toHaveProperty("isSound");
			expect(result).toHaveProperty("isSpeakNames");
		});
	});

	describe("getUserPreferences", () => {
		it("returns existing preferences when found", async () => {
			mockCheckAuth.mockResolvedValue("user-1");
			mockFindUnique.mockResolvedValue({
				colors: {},
				defaultAlarm: "none",
				isSound: false,
				isSpeakNames: false,
			});
			const result = await getUserPreferences();
			expect(result.defaultAlarm).toBe("none");
			expect(mockCreate).not.toHaveBeenCalled();
		});

		it("creates default preferences when none exist", async () => {
			mockCheckAuth.mockResolvedValue("user-1");
			mockFindUnique.mockResolvedValue(null);
			mockCreate.mockResolvedValue({
				colors: {},
				defaultAlarm: "beep-2x",
				isSound: true,
				isSpeakNames: true,
			});
			const result = await getUserPreferences();
			expect(mockCreate).toHaveBeenCalled();
			expect(result).toHaveProperty("defaultAlarm");
		});
	});

	describe("updateUserPreferences", () => {
		beforeEach(() => {
			mockCheckAuth.mockResolvedValue("user-1");
			mockUpsert.mockResolvedValue({
				colors: {
					prepare: "#",
					work: "#",
					rest: "#",
					loop: "#",
					nestedLoop: "#",
				},
				defaultAlarm: "none",
				isSound: false,
				isSpeakNames: false,
			});
		});

		it("updates and returns preferences", async () => {
			const result = await updateUserPreferences({ defaultAlarm: "none" });
			expect(mockUpsert).toHaveBeenCalled();
			expect(result).toHaveProperty("defaultAlarm");
		});

		it("throws when colors missing required key", async () => {
			await expect(
				updateUserPreferences({
					colors: {
						prepare: "#",
						work: "#",
						rest: "#",
						loop: "#",
						nestedLoop: "", // empty
					},
				}),
			).rejects.toThrow("Missing color");
		});
	});
});

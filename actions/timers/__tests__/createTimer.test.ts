import { createTimer } from "@/actions/timers/createTimer";

const mockCheckAuth = jest.fn();
const mockTimerCreate = jest.fn();
const mockUserPrefsFindUnique = jest.fn();

jest.mock("@/actions/auth/authCheck", () => ({
	checkAuth: () => mockCheckAuth(),
}));

jest.mock("next/cache", () => ({
	revalidatePath: jest.fn(),
}));

jest.mock("@/prisma", () => ({
	db: {
		timer: { create: (...args: unknown[]) => mockTimerCreate(...args) },
		userPreferences: {
			findUnique: (...args: unknown[]) => mockUserPrefsFindUnique(...args),
		},
	},
}));

describe("createTimer", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockCheckAuth.mockResolvedValue("user-1");
		mockUserPrefsFindUnique.mockResolvedValue(null);
		mockTimerCreate.mockResolvedValue({
			id: "new-id",
			name: "New Timer",
			userId: "user-1",
		});
	});

	it("creates timer with parsed form data", async () => {
		const formData = {
			name: "My Timer",
			data: { items: [] },
		};

		const result = await createTimer(formData);

		expect(mockCheckAuth).toHaveBeenCalled();
		expect(mockTimerCreate).toHaveBeenCalled();
		expect(result.name).toBe("New Timer");
	});

	it("throws on invalid form data", async () => {
		await expect(createTimer({ name: "" })).rejects.toThrow();
		expect(mockTimerCreate).not.toHaveBeenCalled();
	});
});

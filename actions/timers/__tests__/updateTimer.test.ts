import { updateTimer } from "@/actions/timers/updateTimer";

const mockCheckAuth = jest.fn();
const mockTimerUpdate = jest.fn();

jest.mock("@/actions/auth/authCheck", () => ({
	checkAuth: () => mockCheckAuth(),
}));

jest.mock("next/cache", () => ({
	revalidatePath: jest.fn(),
}));

jest.mock("@/prisma", () => ({
	db: {
		timer: { update: (...args: unknown[]) => mockTimerUpdate(...args) },
	},
}));

describe("updateTimer", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockCheckAuth.mockResolvedValue("user-1");
		mockTimerUpdate.mockResolvedValue({
			id: "t1",
			name: "Updated",
			userId: "user-1",
		});
	});

	it("updates timer for authenticated user", async () => {
		const result = await updateTimer("t1", {
			name: "Updated",
			data: { items: [] },
		});

		expect(mockCheckAuth).toHaveBeenCalled();
		expect(mockTimerUpdate).toHaveBeenCalledWith({
			where: { id: "t1", userId: "user-1" },
			data: expect.objectContaining({ name: "Updated" }),
		});
		expect(result.name).toBe("Updated");
	});

	it("throws when unauthenticated", async () => {
		mockCheckAuth.mockRejectedValue(new Error("unauthenticated"));
		await expect(updateTimer("t1", { name: "X", data: {} })).rejects.toThrow(
			"unauthenticated",
		);
	});
});

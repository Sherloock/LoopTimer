import { deleteTimer } from "@/actions/timers/deleteTimer";

const mockCheckAuth = jest.fn();
const mockTimerDelete = jest.fn();

jest.mock("@/actions/auth/authCheck", () => ({
	checkAuth: () => mockCheckAuth(),
}));

jest.mock("next/cache", () => ({
	revalidatePath: jest.fn(),
}));

jest.mock("@/prisma", () => ({
	db: {
		timer: { delete: (...args: unknown[]) => mockTimerDelete(...args) },
	},
}));

describe("deleteTimer", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockCheckAuth.mockResolvedValue("user-1");
		mockTimerDelete.mockResolvedValue(undefined);
	});

	it("deletes timer for authenticated user", async () => {
		await deleteTimer("t1");

		expect(mockCheckAuth).toHaveBeenCalled();
		expect(mockTimerDelete).toHaveBeenCalledWith({
			where: { id: "t1", userId: "user-1" },
		});
	});

	it("throws when unauthenticated", async () => {
		mockCheckAuth.mockRejectedValue(new Error("unauthenticated"));
		await expect(deleteTimer("t1")).rejects.toThrow("unauthenticated");
	});
});

import { getTimers } from "@/actions/timers/getTimers";

const mockCheckAuth = jest.fn();
const mockFindMany = jest.fn();

jest.mock("@/actions/auth/authCheck", () => ({
	checkAuth: () => mockCheckAuth(),
}));

jest.mock("@/prisma", () => ({
	db: {
		timer: {
			findMany: (...args: unknown[]) => mockFindMany(...args),
		},
	},
}));

describe("getTimers", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockCheckAuth.mockResolvedValue("user-1");
	});

	it("returns timers for authenticated user", async () => {
		const timers = [
			{
				id: "t1",
				name: "Workout",
				data: {},
				category: "custom",
				icon: null,
				color: null,
				updatedAt: new Date(),
			},
		];
		mockFindMany.mockResolvedValue(timers);

		const result = await getTimers();

		expect(mockCheckAuth).toHaveBeenCalled();
		expect(mockFindMany).toHaveBeenCalledWith({
			where: { userId: "user-1" },
			orderBy: { updatedAt: "desc" },
			select: {
				id: true,
				name: true,
				data: true,
				category: true,
				icon: true,
				color: true,
				updatedAt: true,
			},
		});
		expect(result).toEqual(timers);
	});

	it("throws when unauthenticated", async () => {
		mockCheckAuth.mockRejectedValue(new Error("unauthenticated"));

		await expect(getTimers()).rejects.toThrow("unauthenticated");
		expect(mockFindMany).not.toHaveBeenCalled();
	});
});

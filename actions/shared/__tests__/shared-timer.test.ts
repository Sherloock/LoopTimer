import {
	cloneSharedTimer,
	getSharedTimer,
} from "@/actions/shared/getSharedTimer";

const mockSharedFindUnique = jest.fn();
const mockSharedUpdate = jest.fn();
const mockTimerCreate = jest.fn();

jest.mock("@/prisma", () => ({
	db: {
		sharedTimer: {
			findUnique: (...args: unknown[]) => mockSharedFindUnique(...args),
			update: (...args: unknown[]) => mockSharedUpdate(...args),
		},
		timer: {
			create: (...args: unknown[]) => mockTimerCreate(...args),
		},
	},
}));

describe("shared timer actions", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getSharedTimer", () => {
		it("returns error when not found", async () => {
			mockSharedFindUnique.mockResolvedValue(null);
			const result = await getSharedTimer("missing");
			expect(result.success).toBe(false);
			expect(result.error).toContain("not found");
		});

		it("returns success and sharedTimer when found", async () => {
			const shared = {
				id: "sh1",
				name: "Shared",
				data: {},
				expiresAt: null,
			};
			mockSharedFindUnique.mockResolvedValue(shared);
			mockSharedUpdate.mockResolvedValue(shared);
			const result = await getSharedTimer("sh1");
			expect(result.success).toBe(true);
			expect(result.sharedTimer).toEqual(shared);
		});

		it("returns error when expired", async () => {
			mockSharedFindUnique.mockResolvedValue({
				id: "sh1",
				expiresAt: new Date(Date.now() - 1000),
			});
			const result = await getSharedTimer("sh1");
			expect(result.success).toBe(false);
			expect(result.error).toContain("expired");
		});
	});

	describe("cloneSharedTimer", () => {
		it("returns error when not found", async () => {
			mockSharedFindUnique.mockResolvedValue(null);
			const result = await cloneSharedTimer("missing", "user-1");
			expect(result.success).toBe(false);
		});

		it("creates timer and returns success", async () => {
			mockSharedFindUnique.mockResolvedValue({
				id: "sh1",
				name: "Shared",
				data: { items: [] },
				expiresAt: null,
			});
			mockTimerCreate.mockResolvedValue({
				id: "t1",
				name: "Imported Timer",
				userId: "user-1",
			});
			const result = await cloneSharedTimer("sh1", "user-1");
			expect(result.success).toBe(true);
			expect(mockTimerCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({ userId: "user-1" }),
				}),
			);
		});
	});
});

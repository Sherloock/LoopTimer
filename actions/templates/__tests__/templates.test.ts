import { getTemplates } from "@/actions/templates/getTemplates";
import { createTemplate } from "@/actions/templates/createTemplate";
import { cloneTemplate } from "@/actions/templates/cloneTemplate";
import { deleteTemplate } from "@/actions/templates/deleteTemplate";
import { TEMPLATE_CATEGORIES } from "@/lib/constants/timers";

const mockCheckAuth = jest.fn();
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockTemplateCreate = jest.fn();
const mockTimerCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock("@/actions/auth/authCheck", () => ({
	checkAuth: () => mockCheckAuth(),
}));

jest.mock("@/prisma", () => ({
	db: {
		timer: {
			create: (...args: unknown[]) => mockTimerCreate(...args),
		},
		timerTemplate: {
			findMany: (...args: unknown[]) => mockFindMany(...args),
			findUnique: (...args: unknown[]) => mockFindUnique(...args),
			create: (...args: unknown[]) => mockTemplateCreate(...args),
			update: (...args: unknown[]) => mockUpdate(...args),
			delete: (...args: unknown[]) => mockDelete(...args),
		},
	},
}));

describe("templates actions", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockCheckAuth.mockRejectedValue(new Error("unauthenticated"));
	});

	describe("getTemplates", () => {
		it("returns success with templates when db returns", async () => {
			mockFindMany.mockResolvedValue([]);
			const result = await getTemplates();
			expect(result.success).toBe(true);
			expect(result.templates).toEqual([]);
		});
	});

	describe("createTemplate", () => {
		beforeEach(() => {
			mockCheckAuth.mockResolvedValue("user-1");
		});

		it("returns error for invalid category", async () => {
			const result = await createTemplate({
				name: "T",
				category: "invalid",
				data: { items: [] },
			});
			expect(result.success).toBe(false);
			expect(result.error).toContain("category");
		});

		it("creates template with valid params", async () => {
			mockTemplateCreate.mockResolvedValue({
				id: "tp1",
				name: "My Template",
				userId: "user-1",
			});
			const result = await createTemplate({
				name: "My Template",
				category: TEMPLATE_CATEGORIES.HIIT,
				data: { items: [] },
			});
			expect(result.success).toBe(true);
			expect(mockTemplateCreate).toHaveBeenCalled();
		});
	});

	describe("cloneTemplate", () => {
		beforeEach(() => {
			mockCheckAuth.mockResolvedValue("user-1");
		});

		it("returns error when template not found", async () => {
			mockFindUnique.mockResolvedValue(null);
			const result = await cloneTemplate("missing");
			expect(result.success).toBe(false);
			expect(result.error).toContain("not found");
		});

		it("returns success and creates timer when template found", async () => {
			mockFindUnique.mockResolvedValue({
				id: "tp1",
				name: "T",
				data: {},
				isPublic: true,
				userId: "other",
			});
			mockTimerCreate.mockResolvedValue({ id: "t1", name: "T" });
			mockUpdate.mockResolvedValue(undefined);
			const result = await cloneTemplate("tp1");
			expect(result.success).toBe(true);
			expect(mockTimerCreate).toHaveBeenCalled();
		});
	});

	describe("deleteTemplate", () => {
		beforeEach(() => {
			mockCheckAuth.mockResolvedValue("user-1");
		});

		it("returns error when template not found", async () => {
			mockFindUnique.mockResolvedValue(null);
			const result = await deleteTemplate("missing");
			expect(result.success).toBe(false);
		});

		it("deletes when user owns template", async () => {
			mockFindUnique.mockResolvedValue({
				id: "tp1",
				userId: "user-1",
			});
			mockDelete.mockResolvedValue(undefined);
			const result = await deleteTemplate("tp1");
			expect(result.success).toBe(true);
			expect(mockDelete).toHaveBeenCalled();
		});
	});
});

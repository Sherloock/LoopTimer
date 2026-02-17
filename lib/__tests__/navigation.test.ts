import { ROUTES } from "@/lib/constants/routes";

jest.mock("next/navigation", () => ({
	useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
}));
jest.mock("@/components/providers/loading-context", () => ({
	useLoadingContext: () => ({ setLoading: jest.fn() }),
}));

const { navigation } = require("@/lib/navigation");

describe("navigation", () => {
	describe("ROUTES", () => {
		it("exposes expected route constants", () => {
			expect(ROUTES.HOME).toBe("/");
			expect(ROUTES.MENU).toBe("/app/menu");
			expect(ROUTES.TIMER_LIST).toBe("/app/timer/list");
			expect(ROUTES.TIMER_EDIT).toBe("/app/timer/edit");
			expect(ROUTES.TIMER_PLAY).toBe("/app/timer/play");
			expect(ROUTES.TIMER_TEMPLATES).toBe("/app/timer/templates");
		});

		it("SHARED_TIMER is a function returning path with id", () => {
			expect(ROUTES.SHARED_TIMER("abc")).toBe("/shared/abc");
		});
	});

	describe("navigation (static helpers)", () => {
		it("getMenuUrl returns MENU route", () => {
			expect(navigation.getMenuUrl()).toBe(ROUTES.MENU);
		});

		it("getTimerListUrl returns TIMER_LIST route", () => {
			expect(navigation.getTimerListUrl()).toBe(ROUTES.TIMER_LIST);
		});

		it("getEditTimerUrl returns edit route with optional id", () => {
			expect(navigation.getEditTimerUrl()).toBe(ROUTES.TIMER_EDIT);
			expect(navigation.getEditTimerUrl("id1")).toBe(
				`${ROUTES.TIMER_EDIT}?id=id1`,
			);
		});

		it("getPlayTimerUrl returns play route with optional id and autoStart", () => {
			expect(navigation.getPlayTimerUrl()).toBe(ROUTES.TIMER_PLAY);
			expect(navigation.getPlayTimerUrl("id1")).toBe(
				`${ROUTES.TIMER_PLAY}?id=id1&autoStart=true`,
			);
		});

		it("getHomeUrl returns HOME route", () => {
			expect(navigation.getHomeUrl()).toBe(ROUTES.HOME);
		});
	});
});

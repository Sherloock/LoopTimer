/** @jest-environment jsdom */

import { TimersList } from "@/components/timers/list/timers-list";
import { render, screen } from "@testing-library/react";

const useTimersMock = jest.fn();
const useDeleteTimerMock = jest.fn();
const useSaveTimerMock = jest.fn();

jest.mock("@/hooks/use-timers", () => ({
	useTimers: () => useTimersMock(),
	useDeleteTimer: () => useDeleteTimerMock(),
	useSaveTimer: () => useSaveTimerMock(),
}));

jest.mock("@/lib/navigation", () => ({
	useNavigation: () => ({
		goToEditTimer: jest.fn(),
		goToPlayTimer: jest.fn(),
	}),
}));

jest.mock("@/components/timers/editor/user-preferences-dialog", () => ({
	UserPreferencesDialog: () => null,
}));

jest.mock("@/components/timers/import/import-dialog", () => ({
	ImportDialog: () => null,
}));

describe("TimersList", () => {
	beforeEach(() => {
		useTimersMock.mockReset();
		useDeleteTimerMock.mockReset();
		useSaveTimerMock.mockReset();

		useDeleteTimerMock.mockReturnValue({ mutate: jest.fn() });
		useSaveTimerMock.mockReturnValue({ mutate: jest.fn() });
	});

	it("shows loading state", () => {
		useTimersMock.mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
		});

		render(<TimersList />);

		expect(screen.getByText("Timers")).toBeInTheDocument();
		expect(screen.queryByText("New timer")).not.toBeInTheDocument();
	});

	it("shows empty state when no timers exist", () => {
		useTimersMock.mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
		});

		render(<TimersList />);

		expect(screen.getByText("No timers yet")).toBeInTheDocument();
	});

	it("shows error state when loading fails", () => {
		useTimersMock.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
		});

		render(<TimersList />);

		expect(
			screen.getByText((content, element) => {
				return (
					element?.tagName.toLowerCase() === "h3" &&
					content.includes("Couldn") &&
					content.includes("load timers")
				);
			}),
		).toBeInTheDocument();
	});

	it("displays timers with category icons", () => {
		useTimersMock.mockReturnValue({
			data: [
				{
					id: "1",
					name: "HIIT Workout",
					category: "hiit",
					icon: null,
					color: null,
					data: {
						items: [
							{
								id: "work-1",
								name: "Work",
								duration: 30,
								type: "work",
							},
						],
					},
				},
				{
					id: "2",
					name: "Boxing Rounds",
					category: "boxing",
					icon: null,
					color: null,
					data: {
						items: [
							{
								id: "work-1",
								name: "Round",
								duration: 180,
								type: "work",
							},
						],
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		render(<TimersList />);

		expect(screen.getByText("HIIT Workout")).toBeInTheDocument();
		expect(screen.getByText("Boxing Rounds")).toBeInTheDocument();
	});

	it("displays time in compact format for long durations", () => {
		useTimersMock.mockReturnValue({
			data: [
				{
					id: "1",
					name: "Long Workout",
					category: "custom",
					icon: null,
					color: null,
					data: {
						items: [
							{
								id: "work-1",
								name: "Work",
								duration: 6000, // 100 minutes
								type: "work",
							},
						],
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		render(<TimersList />);

		// formatTimeMinutes shows total minutes for all durations
		expect(screen.getByText(/100 min/i)).toBeInTheDocument();
	});

	it("has proper touch target sizes for buttons", () => {
		useTimersMock.mockReturnValue({
			data: [
				{
					id: "1",
					name: "Test Timer",
					category: "custom",
					icon: null,
					color: null,
					data: {
						items: [
							{
								id: "work-1",
								name: "Work",
								duration: 30,
								type: "work",
							},
						],
					},
				},
			],
			isLoading: false,
			isError: false,
		});

		const { container } = render(<TimersList />);

		// Check that menu button has h-11 w-11 (44px minimum)
		const menuButton = container.querySelector(
			'button[aria-label="Timer actions"]',
		);
		expect(menuButton).toHaveClass("h-11", "w-11");

		// Check that Start button has h-11
		const startButton = screen.getByLabelText("Start timer");
		expect(startButton).toHaveClass("h-11");
	});
});

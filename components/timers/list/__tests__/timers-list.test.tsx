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

		expect(screen.getByText("Couldn’t load timers")).toBeInTheDocument();
	});
});

/** @jest-environment jsdom */

import { RunningTimerView } from "@/components/timers/player/running-timer-view";
import { render } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";

jest.mock("@/hooks/use-wake-lock", () => ({
	useWakeLock: () => undefined,
}));

const setMuteMock = jest.fn();

jest.mock("@/lib/sound-utils", () => ({
	getMute: () => false,
	setMute: (value: boolean) => setMuteMock(value),
}));

describe("RunningTimerView", () => {
	beforeEach(() => {
		setMuteMock.mockClear();
	});

	it("toggles mute on KeyM", () => {
		const onPause = jest.fn();
		const onPlay = jest.fn();

		render(
			<RunningTimerView
				timeLeft={10}
				state="running"
				currentSet={1}
				totalSets={1}
				intervalType="workout"
				currentIntervalName="WORK"
				progress={50}
				overallProgress={20}
				totalTimeRemaining={100}
				isHolding={false}
				holdProgress={0}
				nextInterval={undefined}
				onFastBackward={() => undefined}
				onFastForward={() => undefined}
				onHoldStart={() => undefined}
				onHoldEnd={() => undefined}
				onPlay={onPlay}
				onPause={onPause}
			/>,
		);

		fireEvent.keyDown(window, { code: "KeyM" });
		expect(setMuteMock).toHaveBeenCalledWith(true);
	});

	it("pauses on Space when running", () => {
		const onPause = jest.fn();
		const onPlay = jest.fn();

		render(
			<RunningTimerView
				timeLeft={10}
				state="running"
				currentSet={1}
				totalSets={1}
				intervalType="workout"
				currentIntervalName="WORK"
				progress={50}
				overallProgress={20}
				totalTimeRemaining={100}
				isHolding={false}
				holdProgress={0}
				nextInterval={undefined}
				onFastBackward={() => undefined}
				onFastForward={() => undefined}
				onHoldStart={() => undefined}
				onHoldEnd={() => undefined}
				onPlay={onPlay}
				onPause={onPause}
			/>,
		);

		fireEvent.keyDown(window, { code: "Space" });
		expect(onPause).toHaveBeenCalledTimes(1);
	});
});

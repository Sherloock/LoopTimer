/** @jest-environment jsdom */

import { TimerDisplay } from "@/components/timers/player/timer-display";
import { render, screen } from "@testing-library/react";

describe("TimerDisplay", () => {
	it("renders the formatted time and interval name", () => {
		render(
			<TimerDisplay
				timeLeft={65}
				state="running"
				currentIntervalName="WORK"
				currentRound={1}
				totalRounds={3}
				progress={50}
				intervalType="workout"
				nextInterval={{ name: "REST", type: "rest", duration: 10 }}
			/>,
		);

		expect(screen.getByText("01:05")).toBeInTheDocument();
		expect(screen.getByText("WORK")).toBeInTheDocument();
		expect(screen.getByText("SET 1/3")).toBeInTheDocument();
		expect(screen.getByText("Next Up")).toBeInTheDocument();
		expect(screen.getByText("REST")).toBeInTheDocument();
		expect(screen.getByText("00:10")).toBeInTheDocument();
	});

	it("renders a final placeholder when nextInterval is not provided", () => {
		render(
			<TimerDisplay
				timeLeft={5}
				state="running"
				currentIntervalName="REST"
				currentRound={1}
				totalRounds={1}
				progress={90}
				intervalType="rest"
			/>,
		);

		expect(screen.getByText("You're nearly there.")).toBeInTheDocument();
		expect(screen.getByText("the end...")).toBeInTheDocument();
	});
});

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface TimerCompletionScreenProps {
	onBack: () => void;
	onAgain: () => void;
	timerName?: string;
}

export function TimerCompletionScreen({
	onBack,
	onAgain,
	timerName,
}: TimerCompletionScreenProps) {
	return (
		<Card className="mx-auto max-w-md">
			<CardContent className="space-y-6 pt-6 text-center">
				<div className="space-y-4">
					<div className="text-6xl">🎉</div>
					<div className="space-y-2">
						<h2 className="text-2xl font-bold text-green-600">Great Job!</h2>
						{timerName && (
							<p className="text-muted-foreground">You completed {timerName}</p>
						)}
						<p className="text-lg">Workout completed successfully!</p>
					</div>
				</div>

				<div className="flex gap-3">
					<Button variant="outline" onClick={onBack} className="flex-1 gap-2">
						<ArrowLeft size={16} />
						Back
					</Button>
					<Button variant="default" onClick={onAgain} className="flex-1 gap-2">
						<RotateCcw size={16} />
						Again
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

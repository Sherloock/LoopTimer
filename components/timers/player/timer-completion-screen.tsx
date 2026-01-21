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
		<div className="flex min-h-screen items-center justify-center px-4 py-8">
			<Card className="mx-auto w-full max-w-lg">
				<CardContent className="space-y-6 pt-6 text-center">
					<div className="space-y-4">
						<div className="text-6xl">🎉</div>
						<div className="space-y-2">
							<h2 className="text-2xl font-bold text-green-600">Great Job!</h2>
							{timerName && (
								<p className="break-words text-muted-foreground">
									You completed{" "}
									<span className="font-medium text-foreground">
										{timerName}
									</span>
								</p>
							)}
							<p className="text-lg">Workout completed successfully!</p>
						</div>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row">
						<Button
							variant="outline"
							onClick={onBack}
							className="w-full gap-2 sm:flex-1"
						>
							<ArrowLeft size={16} />
							Back
						</Button>
						<Button
							variant="default"
							onClick={onAgain}
							className="w-full gap-2 sm:flex-1"
						>
							<RotateCcw size={16} />
							Again
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

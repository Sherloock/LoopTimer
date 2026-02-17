"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";

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
			<Card className="mx-auto w-full max-w-lg border-2 shadow-lg">
				<CardContent className="space-y-8 px-6 pb-8 pt-8 sm:px-8 sm:pt-10">
					<div className="flex flex-col items-center gap-5 text-center">
						<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
							<CheckCircle2 className="h-9 w-9" strokeWidth={2} />
						</div>
						<div className="space-y-2">
							<h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
								Workout complete
							</h2>
							{timerName && (
								<p className="break-words text-muted-foreground">
									You completed{" "}
									<span className="font-medium text-foreground">
										{timerName}
									</span>
								</p>
							)}
							<p className="text-muted-foreground">
								Great job. Rest or run it again.
							</p>
						</div>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
						<Button
							variant="outline"
							onClick={onBack}
							className="min-h-14 w-full gap-2 text-base sm:min-h-10 sm:flex-1 sm:text-sm"
						>
							<ArrowLeft className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" />
							Back
						</Button>
						<Button
							variant="default"
							onClick={onAgain}
							className="min-h-14 w-full gap-2 text-base sm:min-h-10 sm:flex-1 sm:text-sm"
						>
							<RotateCcw className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" />
							Again
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

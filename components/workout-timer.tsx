"use client";

import { AdvancedTimer } from "@/components/advanced-timer";
import { SavedTimers } from "@/components/saved-timers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, PlusCircle, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export function WorkoutTimer() {
	const [isTimerRunning, setIsTimerRunning] = useState(false);
	const [activeTab, setActiveTab] = useState<string>("advanced");
	const [selectedTimer, setSelectedTimer] = useState<any | null>(null);
	const [timerName, setTimerName] = useState<string>("");

	// Listen for timer state changes from child components
	useEffect(() => {
		const handleTimerStateChange = (event: CustomEvent) => {
			setIsTimerRunning(event.detail.isRunning);
		};

		window.addEventListener(
			"timerStateChange",
			handleTimerStateChange as EventListener,
		);

		return () => {
			window.removeEventListener(
				"timerStateChange",
				handleTimerStateChange as EventListener,
			);
		};
	}, []);

	return (
		<div className="space-y-6">
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				{!isTimerRunning && (
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="advanced" className="flex items-center gap-2">
							<Settings size={16} />
							Advanced Timer
						</TabsTrigger>
						<TabsTrigger value="saved" className="flex items-center gap-2">
							<Bookmark size={16} />
							Saved Timers
						</TabsTrigger>
					</TabsList>
				)}

				<TabsContent value="advanced" className="space-y-6">
					{selectedTimer && (
						<div className="space-y-1 text-center">
							<p className="text-sm text-muted-foreground">Timer Name</p>
							<Input
								className="mx-auto w-40"
								value={timerName}
								onChange={(e) => {
									setTimerName(e.target.value);
									setSelectedTimer({ ...selectedTimer, name: e.target.value });
								}}
							/>
							<Button
								size="sm"
								variant="outline"
								className="mt-2 gap-1"
								onClick={() => {
									setSelectedTimer(null);
									setTimerName("");
								}}
							>
								<PlusCircle size={16} /> New Timer
							</Button>
						</div>
					)}
					<AdvancedTimer
						loadedTimer={
							selectedTimer ? { ...selectedTimer, name: timerName } : undefined
						}
						key={selectedTimer?.id ?? "new"}
					/>
				</TabsContent>

				<TabsContent value="saved" className="space-y-6">
					<SavedTimers
						onLoadTimer={(timer: any) => {
							setSelectedTimer(timer);
							setTimerName(timer.name);
							setActiveTab("advanced");
						}}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}

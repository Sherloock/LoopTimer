"use client";

import { AdvancedTimer } from "@/components/advanced-timer";
import { SavedTimers } from "@/components/saved-timers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Settings } from "lucide-react";
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
					<AdvancedTimer
						loadedTimer={
							selectedTimer ? { ...selectedTimer, name: timerName } : undefined
						}
						key={selectedTimer?.id ?? "new"}
						onTimerNameChange={(name: string) => {
							setTimerName(name);
							if (!name) {
								setSelectedTimer(null);
							}
						}}
						onExit={() => {
							setActiveTab("saved");
						}}
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

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDeleteTimer, useTimers } from "@/hooks/use-timers";
import { formatDistanceToNow } from "date-fns";
import { Edit, Play, Trash2 } from "lucide-react";
import { useState } from "react";

interface SavedTimersProps {
	onLoadTimer: (timer: any) => void;
}

export function SavedTimers({ onLoadTimer }: SavedTimersProps) {
	const { data: timers, isLoading, isError } = useTimers();
	const { mutate: deleteTimer, isPending: isDeleting } = useDeleteTimer();

	if (isLoading) {
		return <p className="text-center">Loading saved timers...</p>;
	}

	if (isError) {
		return <p className="text-center text-destructive">Error loading timers</p>;
	}

	if (!timers || timers.length === 0) {
		return <p className="text-center">No saved timers found.</p>;
	}

	return (
		<div className="h-96 w-full overflow-y-auto rounded-md border p-4">
			<div className="space-y-4">
				{timers.map((timer: any) => (
					<TimerRow key={timer.id} timer={timer} onLoad={onLoadTimer} />
				))}
			</div>
		</div>
	);
}

function TimerRow({ timer, onLoad }: { timer: any; onLoad: (t: any) => void }) {
	const { mutate: deleteTimer, isPending } = useDeleteTimer();
	const [open, setOpen] = useState(false);
	return (
		<div className="flex items-center justify-between gap-4 rounded-md border p-4">
			<div className="flex gap-1">
				<Button
					variant="destructive"
					size="sm"
					className="gap-2"
					onClick={() => setOpen(true)}
				>
					<Trash2 size={16} />
				</Button>
				<Button
					onClick={() => onLoad(timer)}
					size="sm"
					variant="secondary"
					className="gap-2"
				>
					<Edit size={16} />
				</Button>
				<div className="ml-2 space-y-1">
					<p className="font-semibold">{timer.name}</p>
					<p className="text-xs text-muted-foreground">
						updated {formatDistanceToNow(new Date(timer.updatedAt))} ago
					</p>
				</div>
			</div>
			<div className="flex gap-1">
				<Button
					onClick={() => onLoad(timer)}
					size="sm"
					variant="default"
					className="gap-2"
				>
					<Play size={16} />
				</Button>
			</div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent title="Delete Timer?">
					<p>Are you sure you want to delete '{timer.name}'?</p>
					<div className="flex justify-end gap-2 pt-4">
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							disabled={isPending}
							onClick={() => {
								deleteTimer(timer.id);
								setOpen(false);
							}}
						>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

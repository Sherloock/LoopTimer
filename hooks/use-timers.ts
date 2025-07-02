import { TimerInput } from "@/schema/timerSchema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

async function fetchTimers() {
	const res = await fetch("/api/timers");
	if (!res.ok) throw new Error("Failed to load timers");
	return res.json();
}

async function postTimer(data: TimerInput) {
	const res = await fetch("/api/timers", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error("Failed to save timer");
	return res.json();
}

export function useTimers() {
	return useQuery({ queryKey: ["timers"], queryFn: fetchTimers });
}

export function useSaveTimer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: postTimer,
		onSuccess: () => {
			toast.success("Timer saved!", { id: "save-timer" });
			queryClient.invalidateQueries({ queryKey: ["timers"] });
		},
		onError: (error: Error) => {
			toast.error(error.message, { id: "save-timer" });
		},
	});
}

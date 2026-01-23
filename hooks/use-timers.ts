import { TimerInput } from "@/schema/timerSchema";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

async function fetchTimers() {
	const res = await fetch("/api/timers");

	if (res.status === 401) {
		throw new Error("Please sign in to view your timers");
	}

	if (!res.ok) {
		throw new Error("Failed to load timers");
	}

	return res.json();
}

async function postTimer(data: TimerInput) {
	const res = await fetch("/api/timers", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (res.status === 401) {
		throw new Error("Please sign in to save timers");
	}

	if (!res.ok) {
		throw new Error("Failed to save timer");
	}

	return res.json();
}

export function useTimers() {
	return useQuery({
		queryKey: QUERY_KEYS.TIMERS,
		queryFn: fetchTimers,
		retry: (failureCount, error) => {
			// Don't retry on authentication errors
			if (error.message.includes("sign in")) {
				return false;
			}
			return failureCount < 3;
		},
	});
}

export function useSaveTimer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: postTimer,
		onSuccess: (data) => {
			toast.success("Timer saved!", { id: "save-timer" });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIMERS });
			return data;
		},
		onError: (error: Error) => {
			toast.error(error.message, { id: "save-timer" });
		},
	});
}

export function useUpdateTimer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: TimerInput }) => {
			const res = await fetch(`/api/timers/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error("Failed to update timer");
			return res.json();
		},
		onSuccess: () => {
			toast.success("Timer updated!", { id: "save-timer" });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIMERS });
		},
		onError: (error: Error) => {
			toast.error(error.message, { id: "save-timer" });
		},
	});
}

export function useDeleteTimer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/timers/${id}`, { method: "DELETE" });
			if (!res.ok) throw new Error("Failed to delete timer");
		},
		onSuccess: () => {
			toast.success("Timer deleted", { id: "save-timer" });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIMERS });
		},
		onError: (error: Error) => toast.error(error.message),
	});
}

export function useCloneTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (templateId: string) => {
			const res = await fetch(`/api/templates/${templateId}/clone`, {
				method: "POST",
			});
			if (res.status === 401) {
				throw new Error("Please sign in to clone templates");
			}
			if (!res.ok) {
				const error = await res
					.json()
					.catch(() => ({ error: "Failed to clone template" }));
				throw new Error(error.error || "Failed to clone template");
			}
			return res.json();
		},
		onSuccess: () => {
			toast.success("Template cloned to your timers!", {
				id: "clone-template",
			});
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIMERS });
		},
		onError: (error: Error) => {
			toast.error(error.message, { id: "clone-template" });
		},
	});
}

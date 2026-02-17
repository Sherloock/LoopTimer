import { TimerInput } from "@/schema/timerSchema";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
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

export async function fetchTimer(id: string) {
	const res = await fetch(`/api/timers/${id}`);

	if (res.status === 401) {
		throw new Error("Please sign in to view your timers");
	}

	if (!res.ok) {
		throw new Error("Failed to load timer");
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

export function useTimer(id: string | null) {
	const queryClient = useQueryClient();
	const placeholderData = useMemo(() => {
		if (!id) return undefined;
		const list = queryClient.getQueryData(QUERY_KEYS.TIMERS) as
			| Array<{ id: string }>
			| undefined;
		return list?.find((t) => t.id === id);
	}, [queryClient, id]);

	return useQuery({
		queryKey: QUERY_KEYS.TIMER(id ?? ""),
		queryFn: () => fetchTimer(id!),
		enabled: !!id,
		placeholderData,
		retry: (failureCount, error) => {
			if (error.message.includes("sign in")) return false;
			return failureCount < 3;
		},
	});
}

const TEMP_ID_PREFIX = "temp-";

export function useSaveTimer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: postTimer,
		onMutate: async (input) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TIMERS });
			const previous = queryClient.getQueryData(QUERY_KEYS.TIMERS);
			const tempId = `${TEMP_ID_PREFIX}${Date.now()}`;
			const optimisticTimer = {
				id: tempId,
				name: input.name,
				data: input.data,
				category: null,
				icon: null,
				color: null,
				updatedAt: new Date().toISOString(),
				_optimistic: true as const,
			};
			queryClient.setQueryData(QUERY_KEYS.TIMERS, (old: unknown) =>
				Array.isArray(old) ? [optimisticTimer, ...old] : [optimisticTimer],
			);
			return { previous, tempId };
		},
		onSuccess: () => {
			toast.success("Timer saved!", { id: "save-timer" });
		},
		onError: (error: Error, _input, context) => {
			toast.error(error.message, { id: "save-timer" });
			if (context?.previous !== undefined) {
				queryClient.setQueryData(QUERY_KEYS.TIMERS, context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIMERS });
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
		onMutate: async ({ id, data: input }) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TIMERS });
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TIMER(id) });
			const previousList = queryClient.getQueryData(QUERY_KEYS.TIMERS);
			const previousTimer = queryClient.getQueryData(QUERY_KEYS.TIMER(id));
			const patch = {
				...input,
				updatedAt: new Date().toISOString(),
			};
			queryClient.setQueryData(QUERY_KEYS.TIMERS, (old: unknown) =>
				Array.isArray(old)
					? old.map((t: { id: string }) =>
							t.id === id ? { ...t, ...patch } : t,
						)
					: old,
			);
			queryClient.setQueryData(QUERY_KEYS.TIMER(id), (old: unknown) =>
				old && typeof old === "object" ? { ...old, ...patch } : old,
			);
			return { previousList, previousTimer };
		},
		onSuccess: () => {
			toast.success("Timer updated!", { id: "save-timer" });
		},
		onError: (error: Error, { id }, context) => {
			toast.error(error.message, { id: "save-timer" });
			if (context?.previousList !== undefined) {
				queryClient.setQueryData(QUERY_KEYS.TIMERS, context.previousList);
			}
			if (context?.previousTimer !== undefined) {
				queryClient.setQueryData(QUERY_KEYS.TIMER(id), context.previousTimer);
			}
		},
		onSettled: (_data, _error, { id }) => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIMERS });
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIMER(id) });
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
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TIMERS });
			const previous = queryClient.getQueryData(QUERY_KEYS.TIMERS);
			queryClient.setQueryData(QUERY_KEYS.TIMERS, (old: unknown) =>
				Array.isArray(old)
					? old.filter((t: { id: string }) => t.id !== id)
					: old,
			);
			return { previous };
		},
		onSuccess: () => {
			toast.success("Timer deleted", { id: "save-timer" });
		},
		onError: (error: Error, _id, context) => {
			toast.error(error.message);
			if (context?.previous !== undefined) {
				queryClient.setQueryData(QUERY_KEYS.TIMERS, context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIMERS });
		},
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

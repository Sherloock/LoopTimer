import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserPreferencesData } from "@/actions/user/preferences";

const PREFERENCES_QUERY_KEY = ["userPreferences"];

/**
 * Fetches user preferences
 */
export function useUserPreferences() {
	return useQuery<UserPreferencesData>({
		queryKey: PREFERENCES_QUERY_KEY,
		queryFn: async () => {
			const response = await fetch("/api/user/preferences");
			if (!response.ok) {
				throw new Error("Failed to fetch user preferences");
			}
			return response.json();
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Mutation hook for updating user preferences
 */
export function useUpdateUserPreferences() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (preferences: Partial<UserPreferencesData>) => {
			const response = await fetch("/api/user/preferences", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(preferences),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update preferences");
			}

			return response.json();
		},
		onSuccess: () => {
			// Invalidate and refetch preferences
			queryClient.invalidateQueries({ queryKey: PREFERENCES_QUERY_KEY });
		},
	});
}

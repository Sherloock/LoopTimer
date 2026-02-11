"use server";

import { auth } from "@clerk/nextjs/server";
import { cache } from "react";

/**
 * Per-request cached auth check. Uses React.cache() to deduplicate
 * auth() calls within a single request lifecycle.
 */
const getCachedAuth = cache(async () => {
	return auth();
});

/**
 * Throws an error if the current user is not authenticated via Clerk and returns the `userId` otherwise.
 * Deduplicates auth() calls within a single request via React.cache().
 *
 * Usage (inside a server action):
 * ```ts
 * import { checkAuth } from "@/actions/auth/authCheck";
 *
 * export const myAction = async () => {
 *   const userId = checkAuth();
 *   // ... secure logic
 * };
 * ```
 */
export async function checkAuth(): Promise<string> {
	const { userId } = await getCachedAuth();

	if (!userId) {
		throw new Error("unauthenticated");
	}

	return userId;
}

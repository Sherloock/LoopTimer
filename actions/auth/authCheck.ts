"use server";

import { auth } from "@clerk/nextjs/server";

/**
 * Throws an error if the current user is not authenticated via Clerk and returns the `userId` otherwise.
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
	const { userId } = await auth();

	if (!userId) {
		throw new Error("unauthenticated");
	}

	return userId;
}

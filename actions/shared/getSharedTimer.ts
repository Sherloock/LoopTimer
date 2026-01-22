"use server";

import { db } from "@/prisma";

export async function getSharedTimer(id: string) {
	try {
		const sharedTimer = await db.sharedTimer.findUnique({
			where: { id },
		});

		if (!sharedTimer) {
			return { success: false, error: "Shared timer not found" };
		}

		// Check if expired
		if (sharedTimer.expiresAt && sharedTimer.expiresAt < new Date()) {
			return { success: false, error: "Shared timer has expired" };
		}

		// Increment view count
		await db.sharedTimer.update({
			where: { id },
			data: {
				viewCount: { increment: 1 },
			},
		});

		return { success: true, sharedTimer };
	} catch (error) {
		console.error("Error fetching shared timer:", error);
		return { success: false, error: "Failed to fetch shared timer" };
	}
}

export async function cloneSharedTimer(id: string, userId: string) {
	try {
		const sharedTimer = await db.sharedTimer.findUnique({
			where: { id },
		});

		if (!sharedTimer) {
			return { success: false, error: "Shared timer not found" };
		}

		// Check if expired
		if (sharedTimer.expiresAt && sharedTimer.expiresAt < new Date()) {
			return { success: false, error: "Shared timer has expired" };
		}

		// Create a new timer from the shared timer
		const timer = await db.timer.create({
			data: {
				userId,
				name: sharedTimer.name || "Imported Timer",
				data: sharedTimer.data as any,
			},
		});

		return { success: true, timer };
	} catch (error) {
		console.error("Error cloning shared timer:", error);
		return { success: false, error: "Failed to clone shared timer" };
	}
}

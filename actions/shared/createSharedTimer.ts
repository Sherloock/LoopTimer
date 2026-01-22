"use server";

import { db } from "@/prisma";
import type { AdvancedConfig } from "@/types/advanced-timer";
import { checkAuth } from "../auth/authCheck";

export interface CreateSharedTimerParams {
	name: string;
	data: AdvancedConfig;
	expiresInDays?: number | null;
}

export async function createSharedTimer(params: CreateSharedTimerParams) {
	try {
		const userId = await checkAuth();

		const { name, data, expiresInDays } = params;

		// Calculate expiration date if provided
		let expiresAt: Date | null = null;
		if (expiresInDays && expiresInDays > 0) {
			expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + expiresInDays);
		}

		// Create shared timer
		const sharedTimer = await db.sharedTimer.create({
			data: {
				userId,
				name,
				data: data as any,
				expiresAt,
				viewCount: 0,
			},
		});

		return { success: true, sharedTimer };
	} catch (error) {
		console.error("Error creating shared timer:", error);
		return { success: false, error: "Failed to create shared timer" };
	}
}

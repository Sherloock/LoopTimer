"use server";

import { db } from "@/prisma";
import { checkAuth } from "../auth/authCheck";

export async function deleteTemplate(id: string) {
	try {
		const userId = await checkAuth();

		// Fetch existing template
		const existing = await db.timerTemplate.findUnique({
			where: { id },
		});

		if (!existing) {
			return { success: false, error: "Template not found" };
		}

		// Check ownership
		if (existing.userId !== userId) {
			return { success: false, error: "Access denied" };
		}

		// Delete template
		await db.timerTemplate.delete({
			where: { id },
		});

		return { success: true };
	} catch (error) {
		console.error("Error deleting template:", error);
		return { success: false, error: "Failed to delete template" };
	}
}

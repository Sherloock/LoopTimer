"use server";

import { db } from "@/prisma";
import { checkAuth } from "../auth/authCheck";

export async function cloneTemplate(templateId: string) {
	try {
		const userId = await checkAuth();

		// Fetch the template
		const template = await db.timerTemplate.findUnique({
			where: { id: templateId },
		});

		if (!template) {
			return { success: false, error: "Template not found" };
		}

		// Check if user has access (public or owns it)
		if (!template.isPublic && template.userId !== userId) {
			return { success: false, error: "Access denied" };
		}

		// Create a new timer from the template
		const timer = await db.timer.create({
			data: {
				userId,
				name: template.name,
				data: template.data as any,
			},
		});

		// Increment clone count
		await db.timerTemplate.update({
			where: { id: templateId },
			data: {
				cloneCount: { increment: 1 },
			},
		});

		return { success: true, timer };
	} catch (error) {
		console.error("Error cloning template:", error);
		return { success: false, error: "Failed to clone template" };
	}
}

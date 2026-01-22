"use server";

import { db } from "@/prisma";
import { checkAuth } from "../auth/authCheck";
import type { AdvancedConfig } from "@/types/advanced-timer";
import { TEMPLATE_CATEGORIES } from "@/lib/constants/timers";

export interface UpdateTemplateParams {
	id: string;
	name?: string;
	description?: string;
	category?: string;
	data?: AdvancedConfig;
	isPublic?: boolean;
}

export async function updateTemplate(params: UpdateTemplateParams) {
	try {
		const userId = await checkAuth();

		const { id, name, description, category, data, isPublic } = params;

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

		// Validate category if provided
		if (category) {
			const validCategories = Object.values(TEMPLATE_CATEGORIES);
			if (!validCategories.includes(category as any)) {
				return { success: false, error: "Invalid category" };
			}
		}

		// Validate name if provided
		if (name !== undefined) {
			if (!name || name.trim().length === 0) {
				return { success: false, error: "Template name is required" };
			}

			if (name.length > 100) {
				return { success: false, error: "Template name is too long" };
			}
		}

		// Update template
		const updateData: any = {};
		if (name !== undefined) updateData.name = name.trim();
		if (description !== undefined)
			updateData.description = description?.trim() || null;
		if (category !== undefined) updateData.category = category;
		if (data !== undefined) updateData.data = data as any;
		if (isPublic !== undefined) updateData.isPublic = isPublic;

		const template = await db.timerTemplate.update({
			where: { id },
			data: updateData,
		});

		return { success: true, template };
	} catch (error) {
		console.error("Error updating template:", error);
		return { success: false, error: "Failed to update template" };
	}
}

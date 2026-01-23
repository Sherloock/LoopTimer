"use server";

import { db } from "@/prisma";
import { checkAuth } from "../auth/authCheck";
import type { AdvancedConfig } from "@/types/advanced-timer";
import { TEMPLATE_CATEGORIES } from "@/lib/constants/timers";

export interface CreateTemplateParams {
	name: string;
	description?: string;
	category: string;
	icon?: string | null;
	color?: string | null;
	data: AdvancedConfig;
	isPublic?: boolean;
}

export async function createTemplate(params: CreateTemplateParams) {
	try {
		const userId = await checkAuth();

		const {
			name,
			description,
			category,
			icon,
			color,
			data,
			isPublic = false,
		} = params;

		// Validate category
		const validCategories = Object.values(TEMPLATE_CATEGORIES);
		if (!validCategories.includes(category as any)) {
			return { success: false, error: "Invalid category" };
		}

		// Validate name
		if (!name || name.trim().length === 0) {
			return { success: false, error: "Template name is required" };
		}

		if (name.length > 100) {
			return { success: false, error: "Template name is too long" };
		}

		// Create template
		const template = await db.timerTemplate.create({
			data: {
				userId,
				name: name.trim(),
				description: description?.trim() || null,
				category,
				icon: icon ?? null,
				color: color ?? null,
				data: data as any,
				isPublic,
				cloneCount: 0,
			},
		});

		return { success: true, template };
	} catch (error) {
		console.error("Error creating template:", error);
		return { success: false, error: "Failed to create template" };
	}
}

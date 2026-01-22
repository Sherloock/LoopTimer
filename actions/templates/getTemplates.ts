"use server";

import { db } from "@/prisma";
import { checkAuth } from "../auth/authCheck";
import { SYSTEM_USER_ID } from "@/lib/constants/timers";

export interface GetTemplatesParams {
	category?: string;
	search?: string;
	includePrivate?: boolean;
}

export async function getTemplates(params?: GetTemplatesParams) {
	try {
		let userId: string | undefined;
		try {
			userId = await checkAuth();
		} catch {
			// User not authenticated, can still access public templates
			userId = undefined;
		}

		const { category, search, includePrivate = false } = params || {};

		const where: any = {
			OR: [
				{ isPublic: true },
				// Include user's own private templates if authenticated
				...(userId && includePrivate ? [{ userId, isPublic: false }] : []),
			],
		};

		if (category) {
			where.category = category;
		}

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		const templates = await db.timerTemplate.findMany({
			where,
			orderBy: [
				// Then by creation date (newest first)
				{ createdAt: "desc" },
			],
			select: {
				id: true,
				userId: true,
				name: true,
				description: true,
				category: true,
				data: true,
				isPublic: true,
				cloneCount: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return { success: true, templates };
	} catch (error) {
		console.error("Error fetching templates:", error);
		return { success: false, error: "Failed to fetch templates" };
	}
}

export async function getTemplateById(id: string) {
	try {
		let userId: string | undefined;
		try {
			userId = await checkAuth();
		} catch {
			// User not authenticated, can still access public templates
			userId = undefined;
		}

		const template = await db.timerTemplate.findUnique({
			where: { id },
		});

		if (!template) {
			return { success: false, error: "Template not found" };
		}

		// Check if user has access (public or owns it)
		if (!template.isPublic && template.userId !== userId) {
			return { success: false, error: "Access denied" };
		}

		return { success: true, template };
	} catch (error) {
		console.error("Error fetching template:", error);
		return { success: false, error: "Failed to fetch template" };
	}
}

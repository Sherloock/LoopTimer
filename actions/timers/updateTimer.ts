"use server";

import { checkAuth } from "@/actions/auth/authCheck";
import { db } from "@/prisma";
import { timerSchema } from "@/schema/timerSchema";
import { revalidatePath } from "next/cache";

export async function updateTimer(id: string, formData: unknown) {
	const userId = await checkAuth();

	const parsed = timerSchema.parse(formData);

	const updateData: any = {
		name: parsed.name,
		data: parsed.data,
	};

	if (parsed.category !== undefined) {
		updateData.category = parsed.category;
	}
	if (parsed.icon !== undefined) {
		updateData.icon = parsed.icon;
	}
	if (parsed.color !== undefined) {
		updateData.color = parsed.color;
	}
	if (parsed.colors !== undefined) {
		updateData.colors = parsed.colors;
	}
	if (parsed.isSpeakNames !== undefined) {
		updateData.isSpeakNames = parsed.isSpeakNames;
	}
	if (parsed.defaultAlarm !== undefined) {
		updateData.defaultAlarm = parsed.defaultAlarm;
	}
	if (parsed.description !== undefined) {
		updateData.description = parsed.description;
	}

	const timer = await db.timer.update({
		where: { id, userId },
		data: updateData,
	});

	revalidatePath("/");

	return timer;
}

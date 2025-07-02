"use server";

import { checkAuth } from "@/actions/auth/authCheck";
import { db } from "@/prisma";
import { timerSchema } from "@/schema/timerSchema";
import { revalidatePath } from "next/cache";

export async function createTimer(formData: unknown) {
	const userId = await checkAuth();

	const parsed = timerSchema.parse(formData);

	const timer = await db.timer.create({
		data: {
			userId,
			name: parsed.name,
			data: parsed.data,
		},
	});

	// Revalidate root or relevant page
	revalidatePath("/");

	return timer;
}

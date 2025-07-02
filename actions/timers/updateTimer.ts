"use server";

import { checkAuth } from "@/actions/auth/authCheck";
import { db } from "@/prisma";
import { timerSchema } from "@/schema/timerSchema";
import { revalidatePath } from "next/cache";

export async function updateTimer(id: string, formData: unknown) {
	const userId = await checkAuth();

	const parsed = timerSchema.parse(formData);

	const timer = await db.timer.update({
		where: { id, userId },
		data: {
			name: parsed.name,
			data: parsed.data,
		},
	});

	revalidatePath("/");

	return timer;
}

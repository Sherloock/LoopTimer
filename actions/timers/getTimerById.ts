"use server";

import { checkAuth } from "@/actions/auth/authCheck";
import { db } from "@/prisma";

export async function getTimerById(id: string) {
	const userId = await checkAuth();

	const timer = await db.timer.findFirst({
		where: { id, userId },
	});

	if (!timer) {
		throw new Error("Timer not found");
	}

	return timer;
}

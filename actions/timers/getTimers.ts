"use server";

import { checkAuth } from "@/actions/auth/authCheck";
import { db } from "@/prisma";

export async function getTimers() {
	const userId = await checkAuth();

	const timers = await db.timer.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
		select: {
			id: true,
			name: true,
			data: true,
			category: true,
			icon: true,
			color: true,
			updatedAt: true,
		},
	});

	return timers;
}

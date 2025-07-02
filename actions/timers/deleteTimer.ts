"use server";

import { checkAuth } from "@/actions/auth/authCheck";
import { db } from "@/prisma";
import { revalidatePath } from "next/cache";

export async function deleteTimer(id: string) {
	const userId = await checkAuth();
	await db.timer.delete({ where: { id, userId } });
	revalidatePath("/");
}

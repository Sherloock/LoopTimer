import { db } from "@/prisma";

async function main() {
	// Insert a sample timer. Adjust or remove as needed.
	await db.timer.upsert({
		where: { id: "seed-timer" },
		update: {},
		create: {
			id: "seed-timer",
			userId: "seed-user",
			name: "Sample Timer",
			data: {},
		},
	});
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});

import { db } from "../prisma/index.ts";

/**
 * Verify database connection and show timer records
 */
async function verify() {
	try {
		console.log("🔍 Verifying database connection...\n");

		// Test connection
		await db.$connect();
		console.log("✅ Database connection successful\n");

		// Get all timers
		const timers = await db.timer.findMany();
		console.log(`📊 Found ${timers.length} timer(s) in database:\n`);

		// Display timers
		timers.forEach((timer, index) => {
			console.log(`Timer ${index + 1}:`);
			console.log(`  ID: ${timer.id}`);
			console.log(`  Name: ${timer.name}`);
			console.log(`  User ID: ${timer.userId}`);
			console.log(
				`  Created: ${timer.createdAt.toISOString()}`,
			);
			console.log(
				`  Updated: ${timer.updatedAt.toISOString()}`,
			);
			console.log(`  Data: ${JSON.stringify(timer.data, null, 2)}`);
			console.log("");
		});

		// Test raw query
		const result = await db.$queryRaw`SELECT COUNT(*) as count FROM timer`;
		console.log(
			`🔢 Raw query test: ${JSON.stringify(result, (key, value) => (typeof value === "bigint" ? value.toString() : value))}\n`,
		);

		console.log("✅ All database checks passed!");
	} catch (error) {
		console.error("❌ Database verification failed:");
		console.error(error);
		process.exit(1);
	} finally {
		await db.$disconnect();
		console.log("\n🔌 Database connection closed");
	}
}

verify();

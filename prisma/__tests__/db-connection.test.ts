/**
 * Database Connection Tests
 * Tests for Prisma Client database operations
 */

import { db } from "../index";

describe("Database Connection", () => {
	beforeAll(async () => {
		// Ensure database connection is ready
		await db.$connect();
	});

	afterAll(async () => {
		// Clean up database connection
		await db.$disconnect();
	});

	describe("Connection Tests", () => {
		it("should connect to the database successfully", async () => {
			// Test basic connection with a simple query
			const result = await db.$queryRaw`SELECT 1 as result`;
			expect(result).toBeDefined();
		});

		it("should have the timer table accessible", async () => {
			// Verify timer table exists by querying it
			const timers = await db.timer.findMany({ take: 1 });
			expect(Array.isArray(timers)).toBe(true);
		});
	});

	describe("CRUD Operations", () => {
		const testTimerId = "test-timer-crud";
		const testUserId = "test-user-crud";

		afterEach(async () => {
			// Clean up test data after each test
			await db.timer.deleteMany({
				where: {
					id: { startsWith: "test-timer" },
				},
			});
		});

		it("should create a new timer", async () => {
			const timer = await db.timer.create({
				data: {
					id: testTimerId,
					userId: testUserId,
					name: "Test Timer",
					data: {
						type: "simple",
						duration: 60,
					},
				},
			});

			expect(timer).toBeDefined();
			expect(timer.id).toBe(testTimerId);
			expect(timer.userId).toBe(testUserId);
			expect(timer.name).toBe("Test Timer");
			expect(timer.data).toHaveProperty("type", "simple");
			expect(timer.data).toHaveProperty("duration", 60);
		});

		it("should read an existing timer", async () => {
			// Create a timer first
			await db.timer.create({
				data: {
					id: testTimerId,
					userId: testUserId,
					name: "Test Timer Read",
					data: { test: true },
				},
			});

			// Read the timer
			const timer = await db.timer.findUnique({
				where: { id: testTimerId },
			});

			expect(timer).toBeDefined();
			expect(timer?.id).toBe(testTimerId);
			expect(timer?.name).toBe("Test Timer Read");
		});

		it("should update an existing timer", async () => {
			// Create a timer first
			await db.timer.create({
				data: {
					id: testTimerId,
					userId: testUserId,
					name: "Original Name",
					data: { version: 1 },
				},
			});

			// Update the timer
			const updatedTimer = await db.timer.update({
				where: { id: testTimerId },
				data: {
					name: "Updated Name",
					data: { version: 2 },
				},
			});

			expect(updatedTimer.name).toBe("Updated Name");
			expect(updatedTimer.data).toHaveProperty("version", 2);
		});

		it("should delete a timer", async () => {
			// Create a timer first
			await db.timer.create({
				data: {
					id: testTimerId,
					userId: testUserId,
					name: "Timer to Delete",
					data: {},
				},
			});

			// Delete the timer
			await db.timer.delete({
				where: { id: testTimerId },
			});

			// Verify it's deleted
			const deletedTimer = await db.timer.findUnique({
				where: { id: testTimerId },
			});

			expect(deletedTimer).toBeNull();
		});

		it("should find timers by userId", async () => {
			// Create multiple timers for the same user
			await db.timer.createMany({
				data: [
					{
						id: "test-timer-1",
						userId: testUserId,
						name: "Timer 1",
						data: {},
					},
					{
						id: "test-timer-2",
						userId: testUserId,
						name: "Timer 2",
						data: {},
					},
					{
						id: "test-timer-3",
						userId: "other-user",
						name: "Timer 3",
						data: {},
					},
				],
			});

			// Find timers for the test user
			const userTimers = await db.timer.findMany({
				where: { userId: testUserId },
			});

			expect(userTimers.length).toBe(2);
			expect(userTimers.every((t) => t.userId === testUserId)).toBe(true);
		});
	});

	describe("Seeded Data", () => {
		it("should have the seeded timer", async () => {
			const seedTimer = await db.timer.findUnique({
				where: { id: "seed-timer" },
			});

			expect(seedTimer).toBeDefined();
			expect(seedTimer?.userId).toBe("seed-user");
			expect(seedTimer?.name).toBe("Sample Timer");
		});
	});

	describe("Connection Management", () => {
		it("should handle multiple connections properly", async () => {
			// Test that multiple queries work fine
			const query1 = db.timer.count();
			const query2 = db.timer.findMany({ take: 1 });
			const query3 = db.$queryRaw`SELECT COUNT(*) as count FROM timer`;

			const [count, timers, rawCount] = await Promise.all([
				query1,
				query2,
				query3,
			]);

			expect(count).toBeGreaterThanOrEqual(0);
			expect(Array.isArray(timers)).toBe(true);
			expect(rawCount).toBeDefined();
		});

		it("should properly disconnect from database", async () => {
			// This is tested in afterAll, but we can verify it doesn't throw
			await expect(db.$disconnect()).resolves.not.toThrow();
			// Reconnect for other tests
			await db.$connect();
		});
	});

	describe("Error Handling", () => {
		it("should handle non-existent timer gracefully", async () => {
			const timer = await db.timer.findUnique({
				where: { id: "non-existent-id" },
			});

			expect(timer).toBeNull();
		});

		it("should throw error on duplicate id creation", async () => {
			const duplicateId = "test-duplicate-id";

			await db.timer.create({
				data: {
					id: duplicateId,
					userId: "user1",
					name: "First Timer",
					data: {},
				},
			});

			// Try to create another timer with same id
			await expect(
				db.timer.create({
					data: {
						id: duplicateId,
						userId: "user2",
						name: "Duplicate Timer",
						data: {},
					},
				}),
			).rejects.toThrow();

			// Clean up
			await db.timer.delete({ where: { id: duplicateId } });
		});
	});
});

import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as {
	prisma: PrismaClient | undefined;
};

function getSafeDbTarget(urlString: string | undefined) {
	if (!urlString) return "unset";
	try {
		const url = new URL(urlString);
		// pathname is "/dbName" for postgresql urls
		const dbName = url.pathname?.replace(/^\//, "") || "unknown-db";
		return `${url.host}/${dbName}`;
	} catch {
		return "unparseable";
	}
}

const isDev = process.env.NODE_ENV === "development";
const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

// Prisma migrate uses `directUrl` (when present), while Prisma Client uses `url`.
// In local dev this can cause "migrated DB" != "runtime DB". Prefer DIRECT_URL for Prisma Client in dev.
const prismaUrlForRuntime = isDev && directUrl ? directUrl : databaseUrl;

if (isDev && databaseUrl && directUrl && databaseUrl !== directUrl) {
	// Do not log full URLs (may contain credentials).
	console.warn(
		`[prisma] dev: DATABASE_URL (${getSafeDbTarget(
			databaseUrl,
		)}) differs from DIRECT_URL (${getSafeDbTarget(
			directUrl,
		)}); using DIRECT_URL for Prisma Client`,
	);
}

export const db =
	globalForPrisma.prisma ??
	new PrismaClient({
		datasources: prismaUrlForRuntime
			? {
					db: {
						url: prismaUrlForRuntime,
					},
				}
			: undefined,
		log:
			process.env.NODE_ENV === "development"
				? ["query", "error", "warn"]
				: ["error"],
	});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

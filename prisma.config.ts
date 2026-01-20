import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma skips automatic `.env` loading when prisma.config.ts is present.
// We load `.env` by default, and allow overriding via:
//   DOTENV_CONFIG_PATH=.env.prod prisma migrate deploy
config({
	path: process.env.DOTENV_CONFIG_PATH || ".env",
});

export default defineConfig({
	schema: "./prisma/schema.prisma",
	migrations: {
		seed: "tsx prisma/seed.ts",
	},
});


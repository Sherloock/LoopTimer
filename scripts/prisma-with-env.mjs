import { spawn } from "node:child_process";

/**
 * Usage:
 *   node scripts/prisma-with-env.mjs .env.prod migrate deploy
 *
 * This is mainly for Windows: npm scripts run in cmd.exe by default,
 * so `DOTENV_CONFIG_PATH=.env.prod prisma ...` won't work.
 */

const [, , envFile, ...prismaArgs] = process.argv;

if (!envFile || prismaArgs.length === 0) {
	console.error(
		"Usage: node scripts/prisma-with-env.mjs <envFile> <prisma args...>\n" +
			"Example: node scripts/prisma-with-env.mjs .env.prod migrate deploy",
	);
	process.exit(1);
}

console.log(`Loading environment from: ${envFile}`);
console.log(`Running: prisma ${prismaArgs.join(" ")}`);

process.env.DOTENV_CONFIG_PATH = envFile;

// Use shell: true for better Windows compatibility
const child = spawn("npx", ["prisma", ...prismaArgs], {
	stdio: "inherit",
	env: process.env,
	shell: true,
});

child.on("error", (error) => {
	console.error("Error running prisma:", error);
	process.exit(1);
});

child.on("close", (code) => {
	process.exit(code ?? 1);
});


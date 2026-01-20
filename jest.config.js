/** @type {import('jest').Config} */
const config = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>"],
	testMatch: ["**/__tests__/**/*.test.ts"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	collectCoverageFrom: [
		"**/*.{ts,tsx}",
		"!**/*.d.ts",
		"!**/node_modules/**",
		"!**/.next/**",
		"!**/dist/**",
		"!**/coverage/**",
	],
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				tsconfig: {
					jsx: "react",
				},
			},
		],
	},
	// Ignore Next.js specific files
	testPathIgnorePatterns: ["/node_modules/", "/.next/"],
	// Setup files
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};

module.exports = config;

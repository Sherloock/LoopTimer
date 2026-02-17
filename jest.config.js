/** @type {import('jest').Config} */
const config = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>"],
	testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
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
					jsx: "react-jsx",
				},
			},
		],
	},
	// Ignore Next.js specific files
	testPathIgnorePatterns: ["/node_modules/", "/.next/"],
	// Setup files
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
};

module.exports = config;

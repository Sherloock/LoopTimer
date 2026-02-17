// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Learn more: https://github.com/testing-library/jest-dom
require("@testing-library/jest-dom");

// Setup test environment variables
process.env.DATABASE_URL =
	"postgresql://postgres:postgres@localhost:5432/timer?schema=public";
process.env.DIRECT_URL =
	"postgresql://postgres:postgres@localhost:5432/timer?schema=public";
process.env.NODE_ENV = "test";

// matchMedia stub for components that use media queries
Object.defineProperty(global, "matchMedia", {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

import { ClerkProvider } from "@clerk/nextjs";
import type { ComponentProps } from "react";

// Custom interface for the props we actually use
interface ClerkConfig {
	appearance?: ComponentProps<typeof ClerkProvider>["appearance"];
	signInUrl?: string;
	signUpUrl?: string;
	afterSignInUrl?: string;
	afterSignUpUrl?: string;
}

// Validate environment variables
const validateClerkEnv = () => {
	if (typeof window === "undefined") {
		// Server-side only
		const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
		const secretKey = process.env.CLERK_SECRET_KEY;

		if (!publishableKey) {
			console.warn(
				"⚠️ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing. Get it from https://dashboard.clerk.com/last-active?path=api-keys",
			);
		}

		if (!secretKey) {
			console.warn(
				"⚠️ CLERK_SECRET_KEY is missing. Get it from https://dashboard.clerk.com/last-active?path=api-keys",
			);
		}
	}
};

// Run validation
validateClerkEnv();

// Define shared appearance tweaks for Clerk components to keep UI consistent with shadcn/tailwind design system.
const clerkAppearance: ComponentProps<typeof ClerkProvider>["appearance"] = {
	elements: {
		card: "border border-border shadow-sm",
		socialButtonsBlockButton:
			"border border-input hover:bg-accent hover:text-accent-foreground",
		formButtonPrimary: "bg-primary hover:bg-primary/90",
	},
};

/**
 * Re-usable props passed to <ClerkProvider> inside the root layout.
 * Having a central object allows us to keep Clerk configuration
 * in a single place and import it both in the provider and the middleware.
 */
export const clerkProviderProps: ClerkConfig = {
	appearance: clerkAppearance,
	signInUrl: "/sign-in",
	signUpUrl: "/sign-up",
	afterSignInUrl: "/",
	afterSignUpUrl: "/",
};

/**
 * Routes that should stay publicly accessible without requiring
 * authentication. Everything else will be gated by Clerk.
 */
export const publicRoutes: string[] = [
	// Removed "/" since it contains user-specific timer data
	"/sign-in(.*)",
	"/sign-up(.*)",
	"/api/health",
];

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
	"/", // landing page
	"/sign-in(.*)",
	"/sign-up(.*)",
	"/api/health",
];

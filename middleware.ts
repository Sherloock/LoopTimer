import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
	"/", // Make root landing page public
	"/sign-in(.*)",
	"/sign-up(.*)",
	"/api/health",
]);

export default clerkMiddleware(async (auth, req) => {
	// Allow public routes to pass through
	if (isPublicRoute(req)) {
		return NextResponse.next();
	}

	// Check if user is authenticated
	const { userId } = await auth();

	// If not authenticated, redirect to sign-in
	if (!userId) {
		const signInUrl = new URL("/sign-in", req.url);
		return NextResponse.redirect(signInUrl);
	}

	// Allow authenticated users to continue
	return NextResponse.next();
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};

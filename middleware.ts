import { ROUTES } from "@/lib/constants/routes";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
	ROUTES.HOME, // Make root landing page public
	`${ROUTES.SIGN_IN}(.*)`,
	`${ROUTES.SIGN_UP}(.*)`,
	"/api/health",
	// Public metadata/static-ish routes used by <Metadata> / PWA
	"/manifest.json",
	"/icon(.*)",
	"/apple-icon(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
	const pathname = req.nextUrl.pathname;
	if (pathname === "/undefined" || pathname === "/null") {
		const url = req.nextUrl.clone();
		url.pathname = ROUTES.HOME;
		url.search = "";
		return NextResponse.redirect(url);
	}

	// Allow public routes to pass through
	if (isPublicRoute(req)) {
		return NextResponse.next();
	}

	// Preserve the original URL so Clerk can send the user back after sign-in.
	const session = await auth();
	if (!session.userId) {
		return session.redirectToSignIn({ returnBackUrl: req.url });
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

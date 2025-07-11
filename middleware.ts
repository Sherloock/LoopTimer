import { publicRoutes } from "@/lib/clerk";
import { clerkMiddleware } from "@clerk/nextjs/server";

// @ts-expect-error – publicRoutes is supported at runtime but not yet in the Clerk type definitions.
export default clerkMiddleware({ publicRoutes });

export const config = {
	matcher: ["/(.*)"],
};

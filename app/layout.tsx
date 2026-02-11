import { HydrationErrorBoundary } from "@/components/debug/hydration-error-boundary";
import { ClientOnly } from "@/components/providers/client-only";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { clerkProviderProps } from "@/lib/clerk";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Workout Timer",
	description: "A modern workout timer application for fitness enthusiasts",
	keywords: ["workout", "timer", "fitness", "exercise", "training"],
	manifest: "/manifest.json",
	icons: {
		icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
	},
	appleWebApp: {
		title: "Workout Timer",
		statusBarStyle: "default",
		capable: true,
	},
	formatDetection: {
		telephone: false,
	},
	other: {
		"mobile-web-app-capable": "yes",
		"apple-mobile-web-app-capable": "yes",
		"apple-mobile-web-app-status-bar-style": "default",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className} suppressHydrationWarning>
				<HydrationErrorBoundary>
					<ClerkProvider {...clerkProviderProps}>
						<ClientOnly>
							<NextTopLoader
								color="#8B5CF6"
								initialPosition={0.08}
								crawlSpeed={200}
								height={3}
								crawl={true}
								showSpinner={false}
								easing="ease"
								speed={200}
							/>
						</ClientOnly>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							<QueryProvider>
								{children}
								<ClientOnly>
									<Toaster position="bottom-left" />
								</ClientOnly>
							</QueryProvider>
						</ThemeProvider>
					</ClerkProvider>
				</HydrationErrorBoundary>
			</body>
		</html>
	);
}

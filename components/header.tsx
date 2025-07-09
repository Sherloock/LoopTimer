"use client";

import { ClientOnly } from "@/components/client-only";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Moon, Sun, Timer } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Prevent hydration mismatch by only rendering theme-dependent content after mount
	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Timer className="h-6 w-6 text-primary" />
						<span className="hidden text-xl font-bold sm:inline">
							Workout Timer
						</span>
					</div>

					<div className="flex items-center space-x-2">
						{mounted && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setTheme(theme === "light" ? "dark" : "light")}
								className="h-9 w-9"
							>
								<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
								<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
								<span className="sr-only">Toggle theme</span>
							</Button>
						)}

						<ClientOnly>
							<SignedIn>
								<UserButton
									afterSignOutUrl="/"
									appearance={{ elements: { avatarBox: "h-8 w-8" } }}
								/>
							</SignedIn>
							<SignedOut>
								<Link href="/sign-in">
									<Button variant="default">Sign in</Button>
								</Link>
							</SignedOut>
						</ClientOnly>
					</div>
				</div>
			</div>
		</header>
	);
}

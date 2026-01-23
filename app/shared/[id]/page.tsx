import { getSharedTimer } from "@/actions/shared/getSharedTimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import type { AdvancedConfig } from "@/types/advanced-timer";
import { computeTotalTime } from "@/utils/compute-total-time";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Clock, Eye, Link2, Timer } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function SharedTimerPage({ params }: PageProps) {
	const { id } = await params;
	const result = await getSharedTimer(id);

	if (!result.success || !result.sharedTimer) {
		notFound();
	}

	const { sharedTimer } = result;
	const data = sharedTimer.data as unknown as AdvancedConfig;
	const totalSeconds = computeTotalTime(data.items);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	const { userId } = await auth();

	// If user is authenticated and clones, redirect to timer list
	async function handleClone() {
		"use server";
		const { userId } = await auth();
		if (!userId) return;

		const { cloneSharedTimer } =
			await import("@/actions/shared/getSharedTimer");
		const { id: timerId } = await params;
		const result = await cloneSharedTimer(timerId, userId);

		if (result.success) {
			redirect(ROUTES.TIMER_LIST);
		}
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mx-auto max-w-3xl">
				{/* Header */}
				<div className="mb-8 text-center">
					<div className="mb-4 flex items-center justify-center gap-2">
						<Link2 className="h-8 w-8 text-primary" />
						<h1 className="text-3xl font-bold">Shared Timer</h1>
					</div>
					<p className="text-muted-foreground">
						Someone shared this workout timer with you
					</p>
				</div>

				{/* Timer Info Card */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Timer className="h-5 w-5" />
							{sharedTimer.name || "Shared Timer"}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								<span>
									Duration: {minutes}:{seconds.toString().padStart(2, "0")}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Eye className="h-4 w-4" />
								<span>{sharedTimer.viewCount} views</span>
							</div>
						</div>

						{/* Timer Structure Preview */}
						<div className="rounded-md border bg-muted/30 p-4">
							<p className="mb-2 text-sm font-medium">Timer Structure:</p>
							<div className="space-y-1 text-sm text-muted-foreground">
								<p>{data.items.length} intervals/loops</p>
							</div>
						</div>

						{/* Expiration Info */}
						{sharedTimer.expiresAt && (
							<p className="text-sm text-muted-foreground">
								Expires on{" "}
								{new Date(sharedTimer.expiresAt).toLocaleDateString()}
							</p>
						)}
					</CardContent>
				</Card>

				{/* Actions */}
				<div className="flex flex-col gap-4">
					<SignedIn>
						<form action={handleClone}>
							<Button
								type="submit"
								size="lg"
								className="w-full"
								variant="brand"
							>
								Clone to My Timers
							</Button>
						</form>
						<Link href={ROUTES.TIMER_LIST}>
							<Button variant="outline" size="lg" className="w-full">
								Go to My Timers
							</Button>
						</Link>
					</SignedIn>

					<SignedOut>
						<SignInButton mode="modal">
							<Button size="lg" className="w-full" variant="brand">
								Sign In to Clone Timer
							</Button>
						</SignInButton>
						<p className="text-center text-sm text-muted-foreground">
							Sign in to save this timer to your account
						</p>
					</SignedOut>

					<Link href={ROUTES.HOME}>
						<Button variant="ghost" size="lg" className="w-full">
							Back to Home
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

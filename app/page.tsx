import { Header } from "@/components/header";
import { TimersList } from "@/components/timers-list";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
			<Header />
			<main className="container mx-auto py-8">
				<div className="mx-auto max-w-4xl">
					<SignedIn>
						<TimersList />
					</SignedIn>
					<SignedOut>
						<div className="flex min-h-[400px] flex-col items-center justify-center text-center">
							<Loader2
								size={32}
								className="mb-4 animate-spin text-muted-foreground"
							/>
							<p className="text-muted-foreground">Redirecting to sign in...</p>
						</div>
					</SignedOut>
				</div>
			</main>
		</div>
	);
}

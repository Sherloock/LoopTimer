import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { Clock, Timer } from "lucide-react";
import Link from "next/link";

export default function AppPage() {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
				<div className="flex w-full max-w-lg flex-col gap-6 px-4">
					<Link href="/clock" className="group w-full">
						<Button
							variant="outline"
							className="neon-hover-glow relative flex min-h-[200px] w-full flex-col items-center justify-center gap-6 overflow-hidden border-2 border-border bg-card p-8 transition-all hover:border-primary/40 hover:bg-accent/50"
						>
							<div className="neon-glow absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
							<Clock
								size={64}
								className="relative z-10 text-primary transition-transform group-hover:scale-110"
							/>
							<span className="neon-text relative z-10 text-2xl font-semibold">
								Clock
							</span>
						</Button>
					</Link>
					<Link href={ROUTES.TIMER_LIST} className="group w-full">
						<Button
							variant="outline"
							className="neon-hover-glow relative flex min-h-[200px] w-full flex-col items-center justify-center gap-6 overflow-hidden border-2 border-border bg-card p-8 transition-all hover:border-primary/40 hover:bg-accent/50"
						>
							<div className="neon-glow absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
							<Timer
								size={64}
								className="relative z-10 text-primary transition-transform group-hover:scale-110"
							/>
							<span className="neon-text relative z-10 text-2xl font-semibold">
								Advanced Timer
							</span>
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

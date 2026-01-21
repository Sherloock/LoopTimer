import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { Clock, Timer } from "lucide-react";
import Link from "next/link";

export default function AppPage() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-background">
			{/* Animated background lights */}
			<div className="neon-bg-lights absolute inset-0 -z-10" />
			<div className="neon-bg-grid absolute inset-0 -z-10" />

			<Header />
			<div className="relative flex h-[calc(100vh-4rem)] items-center justify-center p-4">
				<div className="flex w-full max-w-lg flex-col gap-6 px-4">
					<Link href="/clock" className="group w-full">
						<Button
							variant="outline"
							className="neon-menu-button relative flex min-h-[200px] w-full flex-col items-center justify-center gap-6 overflow-hidden border-2 border-primary/30 bg-card/80 p-8 backdrop-blur-sm transition-all hover:border-primary/60 hover:bg-card/90"
						>
							<div className="neon-glow absolute inset-0 opacity-30 transition-opacity group-hover:opacity-60" />
							<div className="neon-pulse absolute inset-0 opacity-0 transition-opacity group-hover:opacity-20" />
							<Clock
								size={64}
								className="relative z-10 text-primary transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_hsl(var(--primary)/0.8)]"
							/>
							<span className="neon-text relative z-10 text-2xl font-semibold">
								Clock
							</span>
						</Button>
					</Link>
					<Link href={ROUTES.TIMER_LIST} className="group w-full">
						<Button
							variant="outline"
							className="neon-menu-button relative flex min-h-[200px] w-full flex-col items-center justify-center gap-6 overflow-hidden border-2 border-primary/30 bg-card/80 p-8 backdrop-blur-sm transition-all hover:border-primary/60 hover:bg-card/90"
						>
							<div className="neon-glow absolute inset-0 opacity-30 transition-opacity group-hover:opacity-60" />
							<div className="neon-pulse absolute inset-0 opacity-0 transition-opacity group-hover:opacity-20" />
							<Timer
								size={64}
								className="relative z-10 text-primary transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_hsl(var(--primary)/0.8)]"
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

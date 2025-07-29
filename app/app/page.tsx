import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Clock, Timer } from "lucide-react";
import Link from "next/link";

export default function AppPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
			<Header />
			<div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
				<div className="flex w-full max-w-lg flex-col gap-4 px-4">
					<Link href="/clock" className="w-full">
						<Button
							variant="outline"
							className="flex min-h-[200px] w-full flex-col items-center justify-center gap-6 p-8 transition-all hover:bg-primary hover:text-primary-foreground"
						>
							<Clock size={64} />
							<span className="text-2xl font-semibold">Clock</span>
						</Button>
					</Link>
					<Link href="/advanced-timer" className="w-full">
						<Button
							variant="outline"
							className="flex min-h-[200px] w-full flex-col items-center justify-center gap-6 p-8 transition-all hover:bg-primary hover:text-primary-foreground"
						>
							<Timer size={64} />
							<span className="text-2xl font-semibold">Advanced Timer</span>
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

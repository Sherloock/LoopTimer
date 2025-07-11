import { Header } from "@/components/header";
import { TimersList } from "@/components/timers-list";

export default function AppPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
			<Header />
			<main className="container mx-auto py-8">
				<div className="mx-auto max-w-4xl">
					<TimersList />
				</div>
			</main>
		</div>
	);
}

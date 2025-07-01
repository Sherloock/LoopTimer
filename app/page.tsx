import { Header } from "@/components/header";
import { WorkoutTimer } from "@/components/workout-timer";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
			<Header />
			<main className="container mx-auto px-4 py-8">
				<div className="mx-auto max-w-4xl">
					{/* <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Workout Timer
            </h1>
            <p className="text-muted-foreground text-lg">
              Maximize your training with precision timing
            </p>
          </div> */}
					<WorkoutTimer />
				</div>
			</main>
		</div>
	);
}

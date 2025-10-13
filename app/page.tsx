import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/navigation";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
	ArrowRight,
	BarChart3,
	Clock,
	Play,
	Target,
	Timer,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LandingPage() {
	const { userId } = await auth();
	if (!!userId) {
		redirect(ROUTES.MENU);
	}
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
			{/* Navigation */}
			<nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center space-x-2">
							<Timer size={24} className="text-primary" />
							<span className="text-xl font-bold">Workout Timer</span>
						</div>
						<div className="flex items-center space-x-4">
							<SignedOut>
								<SignInButton mode="modal">
									<Button variant="ghost">Sign In</Button>
								</SignInButton>
								<SignUpButton mode="modal">
									<Button>Get Started</Button>
								</SignUpButton>
							</SignedOut>
							<SignedIn>
								<Link href={ROUTES.MENU}>
									<Button>Go to App</Button>
								</Link>
							</SignedIn>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="px-4 py-20 sm:px-6 lg:px-8">
				<div className="container mx-auto text-center">
					<div className="mx-auto max-w-4xl">
						<h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
							<span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
								Perfect Your Workout
							</span>
							<br />
							<span className="text-foreground">With Custom Timers</span>
						</h1>
						<p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
							Create powerful, customizable workout timers with loops,
							intervals, and rest periods. Take your fitness routine to the next
							level with precision timing.
						</p>
						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<SignedOut>
								<SignUpButton mode="modal">
									<Button size="lg" className="px-8 py-3 text-lg">
										Start Your Journey
										<ArrowRight size={20} className="ml-2" />
									</Button>
								</SignUpButton>
								<SignInButton mode="modal">
									<Button
										variant="outline"
										size="lg"
										className="px-8 py-3 text-lg"
									>
										Sign In
									</Button>
								</SignInButton>
							</SignedOut>
							<SignedIn>
								<Link href={ROUTES.MENU}>
									<Button size="lg" className="px-8 py-3 text-lg">
										Go to Your Timers
										<ArrowRight size={20} className="ml-2" />
									</Button>
								</Link>
							</SignedIn>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="bg-muted/50 px-4 py-20 sm:px-6 lg:px-8">
				<div className="container mx-auto">
					<div className="mb-16 text-center">
						<h2 className="mb-4 text-3xl font-bold">
							Everything You Need for Perfect Workouts
						</h2>
						<p className="mx-auto max-w-2xl text-xl text-muted-foreground">
							Built for athletes, fitness enthusiasts, and anyone who wants to
							optimize their training time.
						</p>
					</div>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						<Card className="border-0 bg-background/60 backdrop-blur-sm">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Clock size={24} className="text-primary" />
								</div>
								<CardTitle>Custom Intervals</CardTitle>
								<CardDescription>
									Create precise work and rest intervals tailored to your
									specific workout needs.
								</CardDescription>
							</CardHeader>
						</Card>
						<Card className="border-0 bg-background/60 backdrop-blur-sm">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Zap size={24} className="text-primary" />
								</div>
								<CardTitle>Loop Control</CardTitle>
								<CardDescription>
									Set up complex workout routines with multiple loops and rounds
									for advanced training.
								</CardDescription>
							</CardHeader>
						</Card>
						<Card className="border-0 bg-background/60 backdrop-blur-sm">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Play size={24} className="text-primary" />
								</div>
								<CardTitle>Easy to Use</CardTitle>
								<CardDescription>
									Intuitive interface that gets out of your way so you can focus
									on your workout.
								</CardDescription>
							</CardHeader>
						</Card>
						<Card className="border-0 bg-background/60 backdrop-blur-sm">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Target size={24} className="text-primary" />
								</div>
								<CardTitle>Precision Timing</CardTitle>
								<CardDescription>
									Accurate to the second timing ensures you get the most out of
									every workout session.
								</CardDescription>
							</CardHeader>
						</Card>
						<Card className="border-0 bg-background/60 backdrop-blur-sm">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<BarChart3 size={24} className="text-primary" />
								</div>
								<CardTitle>Progress Tracking</CardTitle>
								<CardDescription>
									Monitor your workout patterns and stay consistent with your
									fitness goals.
								</CardDescription>
							</CardHeader>
						</Card>
						<Card className="border-0 bg-background/60 backdrop-blur-sm">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Users size={24} className="text-primary" />
								</div>
								<CardTitle>Community Driven</CardTitle>
								<CardDescription>
									Built by fitness enthusiasts for fitness enthusiasts with
									continuous improvements.
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-4 py-20 sm:px-6 lg:px-8">
				<div className="container mx-auto text-center">
					<div className="mx-auto max-w-3xl">
						<h2 className="mb-4 text-3xl font-bold">
							Ready to Transform Your Workouts?
						</h2>
						<p className="mb-8 text-xl text-muted-foreground">
							Join thousands of athletes who have already optimized their
							training with our workout timer.
						</p>
						<SignedOut>
							<SignUpButton mode="modal">
								<Button size="lg" className="px-8 py-3 text-lg">
									Get Started Free
									<ArrowRight size={20} className="ml-2" />
								</Button>
							</SignUpButton>
						</SignedOut>
						<SignedIn>
							<Link href={ROUTES.MENU}>
								<Button size="lg" className="px-8 py-3 text-lg">
									Create Your First Timer
									<ArrowRight size={20} className="ml-2" />
								</Button>
							</Link>
						</SignedIn>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t bg-muted/30">
				<div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
					<div className="flex flex-col items-center justify-between md:flex-row">
						<div className="mb-4 flex items-center space-x-2 md:mb-0">
							<Timer size={20} className="text-primary" />
							<span className="font-semibold">Workout Timer</span>
						</div>
						<p className="text-sm text-muted-foreground">
							© 2024 Workout Timer. Built for fitness enthusiasts.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

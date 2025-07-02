"use client";

import { Component, ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
}

export class HydrationErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		// Check if this is a hydration error
		if (
			error.message.includes("Hydration") ||
			error.message.includes("Text content does not match") ||
			error.message.includes("Expected server HTML to contain")
		) {
			return { hasError: true };
		}
		return { hasError: false };
	}

	componentDidCatch(error: Error, errorInfo: any) {
		// Log the error for debugging
		console.warn("Hydration error caught:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="flex min-h-screen items-center justify-center">
						<div className="text-center">
							<h2 className="text-lg font-semibold text-foreground">
								Something went wrong
							</h2>
							<p className="text-muted-foreground">
								Please refresh the page to continue.
							</p>
							<button
								onClick={() => window.location.reload()}
								className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
							>
								Refresh Page
							</button>
						</div>
					</div>
				)
			);
		}

		return this.props.children;
	}
}

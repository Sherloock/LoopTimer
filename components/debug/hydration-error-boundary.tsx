"use client";

import { Component, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
}

const HYDRATION_ERROR_SUBSTRINGS = [
	"Hydration",
	"Text content does not match",
	"Expected server HTML to contain",
] as const;

function isHydrationError(error: Error): boolean {
	return HYDRATION_ERROR_SUBSTRINGS.some((s) => error.message.includes(s));
}

export class HydrationErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: isHydrationError(error) };
	}

	componentDidCatch(error: Error, errorInfo: unknown) {
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

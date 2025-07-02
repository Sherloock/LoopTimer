"use client";

import { useEffect, useState } from "react";

interface HydrationDebuggerProps {
	componentName: string;
	children: React.ReactNode;
}

export function HydrationDebugger({
	componentName,
	children,
}: HydrationDebuggerProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		if (process.env.NODE_ENV === "development") {
			console.log(`🔄 ${componentName} mounted on client`);
		}
	}, [componentName]);

	if (process.env.NODE_ENV === "development") {
		console.log(
			`📦 ${componentName} rendering on ${mounted ? "client" : "server"}`,
		);
	}

	return <>{children}</>;
}

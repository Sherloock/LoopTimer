"use client";

import dynamic from "next/dynamic";

const SparklesBackground = dynamic(
	() =>
		import("@/components/sparkles/sparkles-background").then((m) => ({
			default: m.SparklesBackground,
		})),
	{ ssr: false },
);

export const ClientSparklesBackground = () => {
	return <SparklesBackground />;
};

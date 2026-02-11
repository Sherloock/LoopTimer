"use client";

import { Sparkles, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { HeroOrbit } from "./hero-orbit";

interface Sparkle {
	index: number;
	size: number;
	distanceFromCenter: number;
	rotation: number;
	isSparkle: boolean;
	orbitDuration: string;
	spinDuration: string;
}

export const SparklesBackground = () => {
	const [sparkles, setSparkles] = useState<Sparkle[]>([]);

	const calculateDistance = useCallback(() => {
		// Get viewport dimensions
		const width = window.innerWidth;
		const height = window.innerHeight;
		// Use diagonal to ensure sparkles are visible on all screen sizes
		const diagonal = Math.sqrt(width * width + height * height);
		// Distance range: 30% to 80% of diagonal
		const minDistance = diagonal * 0.3;
		const maxDistance = diagonal * 0.8;
		return { minDistance, maxDistance };
	}, []);

	const generateSparkles = useCallback(() => {
		const { minDistance, maxDistance } = calculateDistance();
		const distanceRange = maxDistance - minDistance;

		return Array.from({ length: 30 }).map((_, index) => {
			const size = Math.floor(Math.random() * 8) + 4;
			const distanceFromCenter =
				Math.floor(Math.random() * distanceRange) + minDistance;
			const rotation = Math.floor(Math.random() * 360);
			const isSparkle = Math.random() > 0.6;

			// Physical constants and parameters
			const G = 6.6743e-11; // gravitational constant
			const M_central = 1e12; // large central mass
			const rho = 1; // density factor for the object

			// Mass of the orbiting object
			const m_object = rho * Math.pow(size, 3);
			const M_total = M_central + m_object;

			const r = distanceFromCenter;

			// Calculate the orbital period (in seconds)
			const T = 2 * Math.PI * Math.sqrt(r ** 3 / (G * M_total));

			// Scale factor to convert from large astronomical times to visually appealing times
			const scaleFactor = 0.005;
			const orbitDurationSeconds = T * scaleFactor;
			const orbitDuration = `${orbitDurationSeconds}s`;

			const T_spin = (size * size) / Math.sqrt(distanceFromCenter);
			const spinDuration = `${T_spin + 1 * 10}s`;

			return {
				index,
				size,
				distanceFromCenter,
				rotation,
				isSparkle,
				orbitDuration,
				spinDuration,
			};
		});
	}, [calculateDistance]);

	useEffect(() => {
		setSparkles(generateSparkles());

		// Debounced recalculation on window resize
		let resizeTimeoutId: ReturnType<typeof setTimeout>;
		const handleResize = () => {
			clearTimeout(resizeTimeoutId);
			resizeTimeoutId = setTimeout(() => setSparkles(generateSparkles()), 250);
		};

		window.addEventListener("resize", handleResize);
		return () => {
			clearTimeout(resizeTimeoutId);
			window.removeEventListener("resize", handleResize);
		};
	}, [generateSparkles]);

	return (
		<>
			{sparkles.map(
				({
					index,
					size,
					distanceFromCenter,
					rotation,
					isSparkle,
					orbitDuration,
					spinDuration,
				}) => (
					<HeroOrbit
						key={index}
						size={distanceFromCenter}
						rotation={rotation}
						shouldOrbit={true}
						orbitDuration={orbitDuration}
						shouldSpin={true}
						spinDuration={spinDuration}
					>
						{isSparkle ? (
							<Sparkles
								size={size}
								className="text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/1)]"
							/>
						) : (
							<Star
								size={size}
								fill="currentColor"
								className="text-primary/50 drop-shadow-[0_0_6px_hsl(var(--primary)/0.7)]"
							/>
						)}
					</HeroOrbit>
				),
			)}
		</>
	);
};

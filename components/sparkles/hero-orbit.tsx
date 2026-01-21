"use client";

import { PropsWithChildren } from "react";

interface HeroOrbitProps {
	size: number;
	rotation: number;
	style?: React.CSSProperties;
	shouldOrbit?: boolean;
	orbitDuration?: string;
	shouldSpin?: boolean;
	spinDuration?: string;
}

export const HeroOrbit = ({
	children,
	size,
	rotation,
	style,
	shouldOrbit = false,
	orbitDuration = "20s",
	shouldSpin = false,
	spinDuration = "20s",
}: PropsWithChildren<HeroOrbitProps>) => {
	return (
		<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
			<div
				className={shouldOrbit ? "animate-spin" : ""}
				style={{
					animationDuration: orbitDuration,
					animationTimingFunction: "linear",
				}}
			>
				<div
					className="flex items-center justify-start"
					style={{
						width: `${size}px`,
						height: `${size}px`,
						transform: `rotate(${rotation}deg)`,
						...style,
					}}
				>
					<div
						className={shouldSpin ? "animate-spin" : ""}
						style={{
							animationDuration: spinDuration,
						}}
					>
						<div
							className="inline-flex"
							style={{
								transform: `rotate(${rotation * -1}deg)`,
							}}
						>
							{children}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

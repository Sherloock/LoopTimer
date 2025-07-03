"use client";

import { useDroppable } from "@dnd-kit/core";
import React from "react";

interface DroppableZoneProps {
	id: string;
	children: React.ReactNode;
	className?: string;
	isOver?: boolean;
	style?: React.CSSProperties;
}

export function DroppableZone({
	id,
	children,
	className = "",
	isOver = false,
	style,
}: DroppableZoneProps) {
	const { setNodeRef, isOver: isDndOver } = useDroppable({ id });

	return (
		<div
			ref={setNodeRef}
			className={`${className} transition-all duration-200 ${
				isDndOver || isOver
					? "border-dashed border-blue-400 bg-blue-50 shadow-inner"
					: ""
			}`}
			style={style}
		>
			{children}
		</div>
	);
}

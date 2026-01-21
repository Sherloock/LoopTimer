"use client";

import { useDndContext, useDroppable } from "@dnd-kit/core";
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

	// Only show the highlight while a drag operation is active
	const { active } = useDndContext();

	// Determine if the zone should be highlighted
	const shouldHighlight = (isDndOver || isOver) && !!active;

	return (
		<div
			ref={setNodeRef}
			className={`${className} transition-all duration-200 ${
				shouldHighlight
					? "border-dashed border-brand/50 bg-brand/10 shadow-inner"
					: ""
			}`}
			style={style}
		>
			{children}
		</div>
	);
}

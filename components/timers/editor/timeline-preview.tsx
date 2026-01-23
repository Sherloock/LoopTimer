"use client";

import { cn } from "@/lib/utils";
import type { AdvancedConfig, WorkoutItem } from "@/types/advanced-timer";
import { isLoop } from "@/types/advanced-timer";

interface TimelinePreviewProps {
	config: AdvancedConfig;
	className?: string;
}

export function TimelinePreview({ config, className }: TimelinePreviewProps) {
	const items = config.items || [];

	const renderTimeline = (items: WorkoutItem[], depth = 0): JSX.Element[] => {
		const blocks: JSX.Element[] = [];

		items.forEach((item, index) => {
			if (isLoop(item)) {
				// Render loop indicator
				blocks.push(
					<div
						key={`loop-${item.id}-${index}`}
						className="flex items-center gap-0.5 sm:gap-1"
					>
						<div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
							{renderTimeline(item.items, depth + 1).map((block, i) => (
								<div key={i}>{block}</div>
							))}
						</div>
						<span className="text-[10px] font-semibold text-muted-foreground sm:text-xs">
							×{item.loops}
						</span>
					</div>,
				);
			} else {
				// Render interval block
				const colorClass =
					item.type === "work"
						? "bg-interval-workout text-interval-foreground"
						: item.type === "rest"
							? "bg-interval-rest text-interval-foreground"
							: "bg-interval-prepare text-interval-foreground";

				const customColor = item.color
					? { backgroundColor: item.color, color: "#ffffff" }
					: undefined;

				const minutes = Math.floor(item.duration / 60);
				const seconds = item.duration % 60;
				const timeLabel =
					minutes > 0
						? seconds > 0
							? `${minutes}m ${seconds}s`
							: `${minutes}m`
						: `${seconds}s`;

				blocks.push(
					<div
						key={`interval-${item.id}-${index}`}
						className={cn(
							"inline-flex min-w-[50px] items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-semibold sm:min-w-[60px] sm:px-2 sm:py-1 sm:text-xs",
							colorClass,
						)}
						style={customColor}
						title={`${item.name}: ${timeLabel}`}
					>
						<span className="max-w-[40px] truncate sm:max-w-none">
							{item.name}
						</span>
						<span className="ml-0.5 text-[9px] opacity-80 sm:ml-1 sm:text-[10px]">
							{timeLabel}
						</span>
					</div>,
				);
			}
		});

		return blocks;
	};

	const timelineBlocks = renderTimeline(items);

	if (timelineBlocks.length === 0) {
		return (
			<div
				className={cn(
					"rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground",
					className,
				)}
			>
				Add intervals to see timeline preview
			</div>
		);
	}

	return (
		<div
			className={cn(
				"scrollbar-hide max-w-full overflow-x-auto rounded-lg border bg-card/40 p-2 sm:p-3",
				className,
			)}
		>
			<div className="flex min-w-max items-center gap-1 sm:gap-2">
				{timelineBlocks.map((block, index) => (
					<div key={index}>{block}</div>
				))}
			</div>
		</div>
	);
}

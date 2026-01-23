"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TEMPLATE_CATEGORY_LABELS } from "@/lib/constants/timers";
import type { AdvancedConfig } from "@/types/advanced-timer";
import { computeTotalTime } from "@/utils/compute-total-time";
import { Clock, Copy, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TimelinePreview } from "@/components/timers/editor/timeline-preview";

interface TemplateCardProps {
	id: string;
	name: string;
	description?: string | null;
	category: string;
	data: AdvancedConfig;
	cloneCount: number;
	onClone: (templateId: string) => Promise<void>;
}

export function TemplateCard({
	id,
	name,
	description,
	category,
	data,
	cloneCount,
	onClone,
}: TemplateCardProps) {
	const [isCloning, setIsCloning] = useState(false);

	const totalSeconds = computeTotalTime(data.items);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	const handleClone = async () => {
		setIsCloning(true);
		try {
			await onClone(id);
			toast.success("Template cloned to your timers!");
		} catch (error) {
			toast.error("Failed to clone template");
		} finally {
			setIsCloning(false);
		}
	};

	return (
		<Card className="group relative flex h-full flex-col transition-all hover:border-primary/40 hover:shadow-md">
			<CardHeader>
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1">
						<CardTitle className="text-lg">{name}</CardTitle>
						{description && (
							<CardDescription className="mt-1">{description}</CardDescription>
						)}
					</div>
					<Badge variant="outline" className="shrink-0">
						{TEMPLATE_CATEGORY_LABELS[
							category as keyof typeof TEMPLATE_CATEGORY_LABELS
						] || category}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col justify-end space-y-4">
				{/* Timeline Preview */}
				<TimelinePreview config={data} />

				{/* Stats */}
				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-1.5">
						<Clock className="h-4 w-4" />
						<span>
							{minutes}:{seconds.toString().padStart(2, "0")}
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Users className="h-4 w-4" />
						<span>{cloneCount} clones</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span>{data.items.length} intervals</span>
					</div>
				</div>

				{/* Actions */}
				<div className="mt-auto flex gap-2">
					<Button
						onClick={handleClone}
						disabled={isCloning}
						className="flex-1"
						variant="default"
					>
						<Copy className="mr-2 h-4 w-4" />
						{isCloning ? "Cloning..." : "Clone"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

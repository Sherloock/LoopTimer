"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TemplatesBrowser } from "@/components/timers/templates/templates-browser";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { AdvancedConfig } from "@/types/advanced-timer";

interface Template {
	id: string;
	userId: string;
	name: string;
	description?: string | null;
	category: string;
	data: AdvancedConfig;
	isPublic: boolean;
	cloneCount: number;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export default function TemplatesPage() {
	const router = useRouter();
	const [templates, setTemplates] = useState<Template[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchTemplates() {
			try {
				const response = await fetch("/api/templates");
				if (!response.ok) {
					throw new Error("Failed to fetch templates");
				}
				const data = await response.json();
				setTemplates(data);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load templates",
				);
			} finally {
				setIsLoading(false);
			}
		}

		fetchTemplates();
	}, []);

	const handleClone = async (templateId: string) => {
		const response = await fetch(`/api/templates/${templateId}/clone`, {
			method: "POST",
		});

		if (!response.ok) {
			throw new Error("Failed to clone template");
		}

		// Redirect to timer list after successful clone
		router.push(ROUTES.TIMER_LIST);
	};

	const handleTryNow = (templateId: string) => {
		// For now, just clone and redirect
		// In future, could load directly into player
		handleClone(templateId);
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="rounded-lg border border-destructive bg-destructive/10 p-4">
					<p className="text-destructive">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<Link href={ROUTES.TIMER_LIST}>
					<Button variant="ghost" size="sm" className="mb-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Timers
					</Button>
				</Link>
				<h1 className="text-3xl font-bold">Template Library</h1>
				<p className="mt-2 text-muted-foreground">
					Browse and clone pre-built workout timers
				</p>
			</div>

			{/* Templates Browser */}
			<TemplatesBrowser
				templates={templates}
				onClone={handleClone}
				onTryNow={handleTryNow}
			/>
		</div>
	);
}

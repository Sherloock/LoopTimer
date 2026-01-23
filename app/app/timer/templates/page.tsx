"use client";

import { useEffect, useState } from "react";
import { TemplatesBrowser } from "@/components/timers/templates/templates-browser";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { AdvancedConfig } from "@/types/advanced-timer";
import { useCloneTemplate } from "@/hooks/use-timers";
import { useLoadingContext } from "@/components/providers/loading-context";
import { useNavigation } from "@/lib/navigation";
import { TemplateCardSkeleton } from "@/components/timers/templates/template-card-skeleton";

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
	const [templates, setTemplates] = useState<Template[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { mutate: cloneTemplate } = useCloneTemplate();
	const { setLoading } = useLoadingContext();
	const { goToAdvancedTimer } = useNavigation();

	useEffect(() => {
		async function fetchTemplates() {
			setLoading("templates", true);
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
				setLoading("templates", false);
			}
		}

		fetchTemplates();
	}, [setLoading]);

	const handleClone = async (templateId: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			cloneTemplate(templateId, {
				onSuccess: () => {
					goToAdvancedTimer();
					resolve();
				},
				onError: (error) => {
					reject(error);
				},
			});
		});
	};

	if (isLoading) {
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

				{/* Skeleton Loading */}
				<div className="space-y-6">
					<div className="relative">
						<div className="h-10 w-full animate-pulse rounded-md bg-primary/10" />
					</div>
					<div className="h-10 w-full animate-pulse rounded-md bg-primary/10" />
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<TemplateCardSkeleton key={i} />
						))}
					</div>
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
				isLoading={isLoading}
			/>
		</div>
	);
}

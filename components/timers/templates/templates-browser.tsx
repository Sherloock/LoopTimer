"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	TEMPLATE_CATEGORIES,
	TEMPLATE_CATEGORY_LABELS,
} from "@/lib/constants/timers";
import { TemplateCard } from "./template-card";
import { Search } from "lucide-react";
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

interface TemplatesBrowserProps {
	templates: Template[];
	onClone: (templateId: string) => Promise<void>;
	onTryNow?: (templateId: string) => void;
}

export function TemplatesBrowser({
	templates,
	onClone,
	onTryNow,
}: TemplatesBrowserProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	// Filter templates by search query
	const filteredTemplates = templates.filter((template) => {
		const matchesSearch =
			!searchQuery ||
			template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(template.description &&
				template.description.toLowerCase().includes(searchQuery.toLowerCase()));

		const matchesCategory =
			selectedCategory === "all" || template.category === selectedCategory;

		return matchesSearch && matchesCategory;
	});

	// Group templates by category for display
	const categoryCounts = templates.reduce(
		(acc, template) => {
			acc[template.category] = (acc[template.category] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	return (
		<div className="space-y-6">
			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search templates..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-9"
				/>
			</div>

			{/* Category Tabs */}
			<Tabs
				value={selectedCategory}
				onValueChange={setSelectedCategory}
				className="w-full"
			>
				<TabsList className="mb-6 grid w-full grid-cols-4 lg:grid-cols-8">
					<TabsTrigger value="all">All ({templates.length})</TabsTrigger>
					{Object.entries(TEMPLATE_CATEGORIES).map(([key, value]) => (
						<TabsTrigger key={value} value={value}>
							{TEMPLATE_CATEGORY_LABELS[value]} ({categoryCounts[value] || 0})
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value={selectedCategory} className="mt-0">
					{filteredTemplates.length === 0 ? (
						<div className="rounded-lg border border-dashed py-12 text-center">
							<p className="text-muted-foreground">
								{searchQuery
									? "No templates match your search"
									: "No templates in this category"}
							</p>
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{filteredTemplates.map((template) => (
								<TemplateCard
									key={template.id}
									id={template.id}
									name={template.name}
									description={template.description}
									category={template.category}
									data={template.data}
									cloneCount={template.cloneCount}
									onClone={onClone}
									onTryNow={onTryNow}
								/>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

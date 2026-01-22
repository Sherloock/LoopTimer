"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	TEMPLATE_CATEGORIES,
	TEMPLATE_CATEGORY_LABELS,
} from "@/lib/constants/timers";
import type { AdvancedConfig } from "@/types/advanced-timer";
import { Library, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SaveTemplateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	timerName: string;
	timerData: AdvancedConfig;
}

export function SaveTemplateDialog({
	open,
	onOpenChange,
	timerName,
	timerData,
}: SaveTemplateDialogProps) {
	const [name, setName] = useState(timerName);
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState<string>(TEMPLATE_CATEGORIES.CUSTOM);
	const [isPublic, setIsPublic] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		if (!name.trim()) {
			toast.error("Template name is required");
			return;
		}

		setIsSaving(true);
		try {
			const response = await fetch("/api/templates", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					description: description.trim() || null,
					category,
					data: timerData,
					isPublic,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save template");
			}

			toast.success("Template saved successfully!");
			onOpenChange(false);

			// Reset form
			setName(timerName);
			setDescription("");
			setCategory(TEMPLATE_CATEGORIES.CUSTOM);
			setIsPublic(false);
		} catch (error) {
			toast.error("Failed to save template");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Library className="h-5 w-5" />
						Save as Template
					</DialogTitle>
					<DialogDescription>
						Save this timer as a template for future use or sharing
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Template Name */}
					<div className="space-y-2">
						<Label htmlFor="template-name">Template Name</Label>
						<Input
							id="template-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., My HIIT Workout"
							maxLength={100}
						/>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="template-description">
							Description{" "}
							<span className="text-xs text-muted-foreground">(optional)</span>
						</Label>
						<textarea
							id="template-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Describe this template..."
							className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
							maxLength={500}
						/>
					</div>

					{/* Category */}
					<div className="space-y-2">
						<Label htmlFor="template-category">Category</Label>
						<Select value={category} onValueChange={setCategory}>
							<SelectTrigger id="template-category">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(TEMPLATE_CATEGORIES).map(([key, value]) => (
									<SelectItem key={value} value={value}>
										{TEMPLATE_CATEGORY_LABELS[value]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Public Toggle */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="template-public"
							checked={isPublic}
							onCheckedChange={(checked) => setIsPublic(checked === true)}
						/>
						<Label
							htmlFor="template-public"
							className="cursor-pointer text-sm font-normal"
						>
							Make this template public (visible to all users)
						</Label>
					</div>

					{/* Save Button */}
					<Button
						onClick={handleSave}
						disabled={isSaving || !name.trim()}
						className="w-full"
					>
						{isSaving ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Library className="mr-2 h-4 w-4" />
								Save Template
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AI_MAX_RETRIES } from "@/lib/constants/ai";
import type { AdvancedConfig } from "@/types/advanced-timer";
import { Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AiPromptDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onGenerated: (config: AdvancedConfig) => void;
	currentConfig?: AdvancedConfig;
}

export function AiPromptDialog({
	open,
	onOpenChange,
	onGenerated,
	currentConfig,
}: AiPromptDialogProps) {
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [currentAttempt, setCurrentAttempt] = useState(0);
	const [errors, setErrors] = useState<string[]>([]);

	const handleGenerate = async () => {
		if (!prompt.trim()) {
			toast.error("Please enter a workout description", {
				id: "ai-empty-prompt",
			});
			return;
		}

		setIsGenerating(true);
		setCurrentAttempt(1);
		setErrors([]);

		try {
			const response = await fetch("/api/ai/generate-workout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt: prompt.trim(),
					currentConfig,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				// Handle validation errors
				if (data.details && Array.isArray(data.details)) {
					setErrors(data.details);
					toast.error(
						`Failed to generate workout after ${data.attempt || AI_MAX_RETRIES} attempts`,
						{
							id: "ai-generation-failed",
							description:
								data.details.length > 0
									? `First error: ${data.details[0]}`
									: undefined,
						},
					);
				} else {
					toast.error(data.error || "Failed to generate workout", {
						id: "ai-generation-error",
					});
				}
				return;
			}

			// Success!
			toast.success(
				`Workout generated successfully${data.attempt > 1 ? ` (attempt ${data.attempt})` : ""}`,
				{
					id: "ai-generation-success",
				},
			);

			onGenerated(data.config);
			onOpenChange(false);

			// Reset form
			setPrompt("");
			setErrors([]);
		} catch (error) {
			console.error("AI generation error:", error);
			toast.error("Network error. Please try again.", {
				id: "ai-network-error",
			});
		} finally {
			setIsGenerating(false);
			setCurrentAttempt(0);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
			e.preventDefault();
			handleGenerate();
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogClose onClose={() => onOpenChange(false)} />
				<div className="mb-4 flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-purple-500" />
					<h2 className="text-lg font-semibold">AI Workout Generator</h2>
				</div>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="ai-prompt">Describe your workout</Label>
						<Input
							id="ai-prompt"
							placeholder="e.g., 30 minute lower body stretch, or 20 min HIIT workout"
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							onKeyDown={handleKeyDown}
							disabled={isGenerating}
							className="w-full"
							maxLength={1000}
							autoFocus
						/>
						<p className="text-xs text-muted-foreground">
							Be specific about duration, exercise types, and intensity
						</p>
					</div>

					{isGenerating && currentAttempt > 0 && (
						<div className="flex items-center gap-2 rounded-md border border-purple-200 bg-purple-50 p-3 text-sm text-purple-900 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-100">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>
								Generating workout...
								{currentAttempt > 1 &&
									` (Attempt ${currentAttempt}/${AI_MAX_RETRIES})`}
							</span>
						</div>
					)}

					{errors.length > 0 && (
						<div className="space-y-2 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
							<div className="flex items-start gap-2">
								<X className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
								<div className="flex-1 space-y-1">
									<p className="text-sm font-medium text-red-900 dark:text-red-100">
										Generation failed after {AI_MAX_RETRIES} attempts
									</p>
									<div className="space-y-1">
										{errors.slice(0, 3).map((error, idx) => (
											<p
												key={idx}
												className="text-xs text-red-700 dark:text-red-300"
											>
												• {error}
											</p>
										))}
										{errors.length > 3 && (
											<p className="text-xs text-red-600 dark:text-red-400">
												... and {errors.length - 3} more errors
											</p>
										)}
									</div>
									<p className="pt-1 text-xs text-red-600 dark:text-red-400">
										Try rephrasing your prompt or simplifying your request.
									</p>
								</div>
							</div>
						</div>
					)}

					<div className="flex gap-2 pt-2">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isGenerating}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							onClick={handleGenerate}
							disabled={isGenerating || !prompt.trim()}
							className="flex-1 gap-2"
						>
							{isGenerating ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Generating...
								</>
							) : (
								<>
									<Sparkles className="h-4 w-4" />
									Generate
								</>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

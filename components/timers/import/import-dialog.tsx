"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	parseTimerFromFile,
	parseTimerFromJSON,
} from "@/lib/export/timer-import";
import type { AdvancedConfig } from "@/types/advanced-timer";
import { Clipboard, FileUp, Link2, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ImportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onImport: (name: string, data: AdvancedConfig) => Promise<void>;
}

export function ImportDialog({
	open,
	onOpenChange,
	onImport,
}: ImportDialogProps) {
	const [isImporting, setIsImporting] = useState(false);
	const [activeTab, setActiveTab] = useState("file");
	const [clipboardText, setClipboardText] = useState("");
	const [shareLink, setShareLink] = useState("");

	const handleFileImport = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsImporting(true);
		try {
			const result = await parseTimerFromFile(file);

			if (!result.success || !result.data) {
				toast.error(result.error || "Invalid timer file");
				return;
			}

			await onImport(result.data.timer.name, result.data.timer.data);
			toast.success("Timer imported successfully!");
			onOpenChange(false);
		} catch (error) {
			toast.error("Failed to import timer");
		} finally {
			setIsImporting(false);
		}
	};

	const handleClipboardImport = async () => {
		if (!clipboardText.trim()) {
			toast.error("Please paste timer JSON");
			return;
		}

		setIsImporting(true);
		try {
			const result = parseTimerFromJSON(clipboardText);

			if (!result.success || !result.data) {
				toast.error(result.error || "Invalid timer format");
				return;
			}

			await onImport(result.data.timer.name, result.data.timer.data);
			toast.success("Timer imported successfully!");
			onOpenChange(false);
		} catch (error) {
			toast.error("Failed to import timer");
		} finally {
			setIsImporting(false);
		}
	};

	const handlePasteFromClipboard = async () => {
		try {
			const text = await navigator.clipboard.readText();
			setClipboardText(text);
			toast.success("Pasted from clipboard");
		} catch (error) {
			toast.error("Failed to read clipboard");
		}
	};

	const handleShareLinkImport = () => {
		if (!shareLink.trim()) {
			toast.error("Please enter a share link");
			return;
		}

		try {
			// Extract ID from URL
			const url = new URL(shareLink);
			const pathParts = url.pathname.split("/");
			const id = pathParts[pathParts.length - 1];

			if (!id) {
				toast.error("Invalid share link");
				return;
			}

			// Redirect to shared timer page
			window.location.href = `/shared/${id}`;
		} catch (error) {
			toast.error("Invalid share link format");
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const file = e.dataTransfer.files?.[0];
		if (!file) return;

		if (!file.name.endsWith(".json")) {
			toast.error("Please drop a JSON file");
			return;
		}

		setIsImporting(true);
		try {
			const result = await parseTimerFromFile(file);

			if (!result.success || !result.data) {
				toast.error(result.error || "Invalid timer file");
				return;
			}

			await onImport(result.data.timer.name, result.data.timer.data);
			toast.success("Timer imported successfully!");
			onOpenChange(false);
		} catch (error) {
			toast.error("Failed to import timer");
		} finally {
			setIsImporting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileUp className="h-5 w-5" />
						Import Timer
					</DialogTitle>
					<DialogDescription>
						Import a timer from a file, clipboard, or share link
					</DialogDescription>
				</DialogHeader>

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="file">
							<Upload className="mr-2 h-4 w-4" />
							File
						</TabsTrigger>
						<TabsTrigger value="clipboard">
							<Clipboard className="mr-2 h-4 w-4" />
							Clipboard
						</TabsTrigger>
						<TabsTrigger value="link">
							<Link2 className="mr-2 h-4 w-4" />
							Link
						</TabsTrigger>
					</TabsList>

					{/* File Upload Tab */}
					<TabsContent value="file" className="space-y-4">
						<div
							className="rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary"
							onDragOver={handleDragOver}
							onDrop={handleDrop}
						>
							<Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<p className="mb-2 text-sm font-medium">
								Drag and drop a JSON file here
							</p>
							<p className="mb-4 text-xs text-muted-foreground">
								or click to browse
							</p>
							<Label htmlFor="file-upload">
								<Button variant="outline" className="cursor-pointer" asChild>
									<span>
										<FileUp className="mr-2 h-4 w-4" />
										Choose File
									</span>
								</Button>
							</Label>
							<Input
								id="file-upload"
								type="file"
								accept=".json"
								className="hidden"
								onChange={handleFileImport}
								disabled={isImporting}
							/>
						</div>
						{isImporting && (
							<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin" />
								Importing...
							</div>
						)}
					</TabsContent>

					{/* Clipboard Tab */}
					<TabsContent value="clipboard" className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="clipboard-text">Timer JSON</Label>
							<textarea
								id="clipboard-text"
								value={clipboardText}
								onChange={(e) => setClipboardText(e.target.value)}
								placeholder="Paste timer JSON here..."
								className="min-h-[200px] w-full rounded-md border bg-background px-3 py-2 text-sm"
							/>
						</div>
						<div className="flex gap-2">
							<Button
								onClick={handlePasteFromClipboard}
								variant="outline"
								className="flex-1"
							>
								<Clipboard className="mr-2 h-4 w-4" />
								Paste from Clipboard
							</Button>
							<Button
								onClick={handleClipboardImport}
								disabled={isImporting || !clipboardText.trim()}
								className="flex-1 gap-2"
							>
								{isImporting ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Importing...
									</>
								) : (
									<>
										<Upload className="h-4 w-4" />
										Import
									</>
								)}
							</Button>
						</div>
					</TabsContent>

					{/* Share Link Tab */}
					<TabsContent value="link" className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="share-link">Share Link or ID</Label>
							<Input
								id="share-link"
								value={shareLink}
								onChange={(e) => setShareLink(e.target.value)}
								placeholder="https://timer.app/shared/abc123 or abc123"
							/>
						</div>
						<Button
							onClick={handleShareLinkImport}
							disabled={!shareLink.trim()}
							className="w-full"
						>
							<Link2 className="mr-2 h-4 w-4" />
							Open Share Link
						</Button>
						<p className="text-xs text-muted-foreground">
							You&apos;ll be redirected to the shared timer page where you can
							clone it
						</p>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}

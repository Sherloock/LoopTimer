"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save as SaveIcon } from "lucide-react";

interface TimerEditorHeaderProps {
	onBack: () => void;
	onSave: () => void;
	isSaving: boolean;
}

/**
 * Desktop sticky header with back and save buttons.
 */
export function TimerEditorDesktopHeader({
	onBack,
	onSave,
	isSaving,
}: TimerEditorHeaderProps) {
	return (
		<div className="sticky top-0 z-10 hidden items-center justify-between gap-2 border-b bg-background/80 px-4 py-2 backdrop-blur md:flex">
			<Button
				variant="ghost"
				size="icon"
				onClick={onBack}
				className="hidden md:inline-flex"
			>
				<ArrowLeft size={16} />
				<span className="sr-only">Back</span>
			</Button>

			<Button
				onClick={onSave}
				variant="brand"
				size="sm"
				className="gap-2"
				disabled={isSaving}
			>
				{isSaving ? (
					"Saving..."
				) : (
					<>
						<SaveIcon size={16} /> Save
					</>
				)}
			</Button>
		</div>
	);
}

/**
 * Mobile floating buttons for back and save.
 * These are positioned fixed at the bottom for thumb-reachability.
 */
export function TimerEditorMobileButtons({
	onBack,
	onSave,
	isSaving,
}: TimerEditorHeaderProps) {
	return (
		<>
			{/* Mobile: thumb-reachable back button */}
			<Button
				variant="outline"
				size="icon"
				className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-background/80 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
				onClick={onBack}
			>
				<ArrowLeft size={20} />
				<span className="sr-only">Back</span>
			</Button>

			{/* Mobile: thumb-reachable save button */}
			<Button
				onClick={onSave}
				variant="brand"
				size="icon"
				className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg md:hidden"
				disabled={isSaving}
			>
				<SaveIcon size={20} />
				<span className="sr-only">{isSaving ? "Saving..." : "Save"}</span>
			</Button>
		</>
	);
}

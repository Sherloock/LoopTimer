"use client";

import { Button } from "@/components/ui/button";
import { downloadTimerAsJSON } from "@/lib/export/timer-export";
import type { AdvancedConfig } from "@/types/advanced-timer";
import {
	Download,
	Library,
	Repeat,
	Settings,
	Share2,
	Wand2,
} from "lucide-react";

interface TimerEditorActionsProps {
	timerName: string;
	config: AdvancedConfig;
	onOpenAiDialog: () => void;
	onOpenSaveTemplateDialog: () => void;
	onOpenShareDialog: () => void;
	onOpenSettings: () => void;
	onAddLoop: () => void;
}

/**
 * Action buttons grid for the timer editor.
 * Contains AI Generate, Save Template, Share, Export, Settings, and Add Loop.
 */
export function TimerEditorActions({
	timerName,
	config,
	onOpenAiDialog,
	onOpenSaveTemplateDialog,
	onOpenShareDialog,
	onOpenSettings,
	onAddLoop,
}: TimerEditorActionsProps) {
	const handleExport = () => {
		downloadTimerAsJSON(timerName, config);
	};

	return (
		<div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
			<Button
				onClick={onOpenAiDialog}
				variant="default"
				size="sm"
				className="gap-2"
			>
				<Wand2 size={16} />
				<span className="hidden sm:inline">AI Generate</span>
				<span className="sm:hidden">AI</span>
			</Button>
			<Button
				onClick={onOpenSaveTemplateDialog}
				variant="outline"
				size="sm"
				className="gap-2"
			>
				<Library size={16} />
				<span className="hidden sm:inline">Save Template</span>
				<span className="sm:hidden">Template</span>
			</Button>
			<Button
				onClick={onOpenShareDialog}
				variant="outline"
				size="sm"
				className="gap-2"
			>
				<Share2 size={16} />
				<span className="hidden sm:inline">Share</span>
				<span className="sm:hidden">Share</span>
			</Button>
			<Button
				onClick={handleExport}
				variant="outline"
				size="sm"
				className="gap-2"
			>
				<Download size={16} />
				<span className="hidden sm:inline">Export</span>
				<span className="sm:hidden">Export</span>
			</Button>
			<Button
				onClick={onOpenSettings}
				variant="control"
				size="sm"
				className="gap-2"
			>
				<Settings size={16} />
				<span className="hidden sm:inline">Settings</span>
				<span className="sm:hidden">Settings</span>
			</Button>
			<Button onClick={onAddLoop} variant="control" size="sm" className="gap-2">
				<Repeat size={16} />
				<span className="hidden sm:inline">Add Loop</span>
				<span className="sm:hidden">Loop</span>
			</Button>
		</div>
	);
}

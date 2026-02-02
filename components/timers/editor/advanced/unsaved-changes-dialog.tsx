"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Save as SaveIcon, Undo, X } from "lucide-react";

interface UnsavedChangesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDiscard: () => void;
	onSaveAndExit: () => void;
	isPending: boolean;
}

export function UnsavedChangesDialog({
	open,
	onOpenChange,
	onDiscard,
	onSaveAndExit,
	isPending,
}: UnsavedChangesDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-sm">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold">Unsaved changes</h2>
				</div>
				<div className="py-2 text-sm text-muted-foreground">
					You have unsaved changes. What would you like to do?
				</div>
				<div className="flex flex-col gap-2 pt-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="w-full md:w-auto"
					>
						<X size={16} className="mr-2" /> Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={() => {
							onOpenChange(false);
							onDiscard();
						}}
						className="w-full md:w-auto"
					>
						<Undo size={16} className="mr-2" /> Back without saving
					</Button>
					<Button
						disabled={isPending}
						onClick={onSaveAndExit}
						className="w-full md:w-auto"
					>
						<SaveIcon size={16} className="mr-2" />
						{isPending ? "Saving..." : "Save and back"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

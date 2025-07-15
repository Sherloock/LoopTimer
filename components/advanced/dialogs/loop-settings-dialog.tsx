"use client";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { ColorSettings, LoopGroup } from "@/types/advanced-timer";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	item: LoopGroup;
	onUpdate: (id: string, field: string, value: any) => void;
	onMoveUp: (id: string) => void;
	onMoveDown: (id: string) => void;
	onMoveToTop: (id: string) => void;
	onMoveToBottom: (id: string) => void;
	colors: ColorSettings;
}

export default function LoopSettingsDialog({
	isOpen,
	onClose,
	item,
	onUpdate,
	onMoveUp,
	onMoveDown,
	onMoveToTop,
	onMoveToBottom,
	colors,
}: Props) {
	const itemColor = item.color || colors.loop;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent title="Loop Settings" className="max-w-md">
				<DialogClose onClose={onClose} />

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Number of Loops</Label>
						<NumberInput
							value={item.loops}
							onChange={(value) => onUpdate(item.id, "loops", value)}
							min={1}
							step={1}
						/>
					</div>

					<ColorPicker
						label="Custom Color"
						value={itemColor}
						onChange={(color) => onUpdate(item.id, "color", color)}
					/>

					<div className="space-y-2">
						<Label>Position</Label>
						<div className="grid grid-cols-2 gap-2">
							<Button
								onClick={() => {
									onMoveUp(item.id);
									onClose();
								}}
								variant="outline"
								className="gap-2"
							>
								<ChevronUp size={16} /> Move Up
							</Button>
							<Button
								onClick={() => {
									onMoveDown(item.id);
									onClose();
								}}
								variant="outline"
								className="gap-2"
							>
								<ChevronDown size={16} /> Move Down
							</Button>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<Button
								onClick={() => {
									onMoveToTop(item.id);
									onClose();
								}}
								variant="outline"
								className="gap-2"
							>
								↑ To Top
							</Button>
							<Button
								onClick={() => {
									onMoveToBottom(item.id);
									onClose();
								}}
								variant="outline"
								className="gap-2"
							>
								↓ To Bottom
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

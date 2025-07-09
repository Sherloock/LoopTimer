"use client";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { ColorSettings, LoopGroup } from "@/types/advanced-timer";
import { Copy, Trash2 } from "lucide-react";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	item: LoopGroup;
	onUpdate: (id: string, field: string, value: any) => void;
	onDuplicate: (id: string) => void;
	onDelete: (id: string) => void;
	onMoveToTop: (id: string) => void;
	onMoveToBottom: (id: string) => void;
	colors: ColorSettings;
}

export default function LoopSettingsDialog({
	isOpen,
	onClose,
	item,
	onUpdate,
	onDuplicate,
	onDelete,
	onMoveToTop,
	onMoveToBottom,
	colors,
}: Props) {
	const itemColor = item.color || colors.loop;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent title={`${item.name} Settings`} className="max-w-md">
				<DialogClose onClose={onClose} />

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Loop Name</Label>
						<Input
							value={item.name}
							onChange={(e) => onUpdate(item.id, "name", e.target.value)}
							placeholder="Loop name"
						/>
					</div>

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

					<div className="flex gap-2">
						<Button
							onClick={() => {
								onMoveToTop(item.id);
								onClose();
							}}
							variant="outline"
							className="flex-1 gap-2"
						>
							↑ Top
						</Button>
						<Button
							onClick={() => {
								onMoveToBottom(item.id);
								onClose();
							}}
							variant="outline"
							className="flex-1 gap-2"
						>
							↓ Bottom
						</Button>
					</div>

					<div className="flex gap-2 pt-4">
						<Button
							onClick={() => {
								onDuplicate(item.id);
								onClose();
							}}
							variant="outline"
							className="flex-1 gap-2"
						>
							<Copy size={16} /> Duplicate
						</Button>
						<Button
							onClick={() => {
								onDelete(item.id);
								onClose();
							}}
							variant="destructive"
							className="flex-1 gap-2"
						>
							<Trash2 size={16} /> Delete
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

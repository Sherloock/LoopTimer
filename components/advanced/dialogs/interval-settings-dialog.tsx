"use client";

import { Checkbox } from "@/components/advanced/checkbox";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { SOUND_OPTIONS, playSound } from "@/lib/sound-utils";
import {
	ColorSettings,
	IntervalStep,
	getDefaultNameForType,
} from "@/types/advanced-timer";
import { Copy, Trash2 } from "lucide-react";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	item: IntervalStep;
	onUpdate: (id: string, field: string, value: any) => void;
	onDuplicate: (id: string) => void;
	onDelete: (id: string) => void;
	onMoveToTop: (id: string) => void;
	onMoveToBottom: (id: string) => void;
	colors: ColorSettings;
}

export default function IntervalSettingsDialog({
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
	const itemColor = item.color || colors[item.type];

	const handleTypeChange = (newType: "prepare" | "work" | "rest") => {
		onUpdate(item.id, "type", newType);
		onUpdate(item.id, "name", getDefaultNameForType(newType));
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent title={`${item.name} Settings`} className="max-w-md">
				<DialogClose onClose={onClose} />

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Interval Name</Label>
						<Input
							value={item.name}
							onChange={(e) => onUpdate(item.id, "name", e.target.value)}
							placeholder="Interval name"
						/>
					</div>

					<div className="space-y-2">
						<Label>Duration (seconds)</Label>
						<NumberInput
							value={item.duration}
							onChange={(value) => onUpdate(item.id, "duration", value)}
							min={1}
							step={5}
						/>
					</div>

					<div className="space-y-2">
						<Label>Interval Type</Label>
						<select
							value={item.type}
							onChange={(e) =>
								handleTypeChange(e.target.value as "prepare" | "work" | "rest")
							}
							className="w-full rounded-md border px-3 py-2"
						>
							<option value="prepare">Prepare</option>
							<option value="work">Work</option>
							<option value="rest">Rest</option>
						</select>
					</div>

					{/* Sound selector */}
					<div className="space-y-2">
						<Label>Sound</Label>
						<div className="flex gap-2">
							<select
								value={item.sound ?? ""}
								onChange={(e) => {
									const val = e.target.value || undefined;
									onUpdate(item.id, "sound", val);
									playSound(val);
								}}
								className="flex-1 rounded-md border px-3 py-2"
							>
								<option value="">Default</option>
								{SOUND_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>

							<Button
								variant="outline"
								size="icon"
								onClick={() => playSound(item.sound || undefined)}
							>
								▶
							</Button>
						</div>
					</div>

					<ColorPicker
						label="Custom Color"
						value={itemColor}
						onChange={(color) => onUpdate(item.id, "color", color)}
					/>

					<div className="flex items-center gap-2">
						<Checkbox
							id={`skip-last-${item.id}`}
							checked={Boolean(item.skipOnLastLoop)}
							onCheckedChange={(checked) =>
								onUpdate(item.id, "skipOnLastLoop", checked)
							}
						/>
						<Label htmlFor={`skip-last-${item.id}`} className="text-sm">
							Skip on last loop
						</Label>
					</div>

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

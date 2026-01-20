"use client";

import { Checkbox } from "@/components/advanced/checkbox";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SOUND_OPTIONS, playSound } from "@/lib/sound-utils";
import {
	ColorSettings,
	IntervalStep,
	getDefaultNameForType,
} from "@/types/advanced-timer";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	item: IntervalStep;
	onUpdate: (id: string, field: string, value: any) => void;
	onMoveUp: (id: string) => void;
	onMoveDown: (id: string) => void;
	onMoveToTop: (id: string) => void;
	onMoveToBottom: (id: string) => void;
	colors: ColorSettings;
}

export default function IntervalSettingsDialog({
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
							min={0}
							step={5}
						/>
					</div>

					<div className="space-y-2">
						<Label>Interval Type</Label>
						<Select
							value={item.type}
							onValueChange={(value) =>
								handleTypeChange(value as "prepare" | "work" | "rest")
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="prepare">Prepare</SelectItem>
								<SelectItem value="work">Work</SelectItem>
								<SelectItem value="rest">Rest</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Sound selector */}
					<div className="space-y-2">
						<Label>Sound</Label>
						<div className="flex gap-2">
							<Select
								value={item.sound ?? "default"}
								onValueChange={(value) => {
									const val = value === "default" ? undefined : value;
									onUpdate(item.id, "sound", val);
									playSound(val);
								}}
							>
								<SelectTrigger className="flex-1">
									<SelectValue placeholder="Default" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="default">Default</SelectItem>
									{SOUND_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

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

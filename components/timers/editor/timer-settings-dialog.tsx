"use client";

import { Checkbox } from "@/components/timers/editor/advanced/dnd/checkbox";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { FloatLabel } from "@/components/ui/float-label";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ADVANCED_TIMER_DEFAULT_COLORS,
	TEMPLATE_CATEGORIES,
	TEMPLATE_CATEGORY_LABELS,
	TIMER_CATEGORY_ICONS,
} from "@/lib/constants/timers";
import { playSound, SOUND_OPTIONS } from "@/lib/sound-utils";
import {
	clearItemLevelColors,
	mergeUserPreferences,
} from "@/lib/workout-processing";
import type {
	ColorSettings,
	LoadedTimer,
	WorkoutItem,
} from "@/types/advanced-timer";
import {
	Activity,
	Check,
	Clock,
	Dumbbell,
	Flame,
	Heart,
	RotateCcw,
	Settings,
	Target,
	Timer,
	Trash2,
	type LucideIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserPreferences } from "@/hooks/use-user-preferences";

const ICON_MAP: Record<string, LucideIcon> = {
	Activity,
	Clock,
	Dumbbell,
	Flame,
	Heart,
	Target,
	Timer,
};

interface TimerSettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	timer: LoadedTimer | null;
	workoutItems: WorkoutItem[];
	onSave: (settings: {
		category: string;
		icon: string | null;
		color: string | null;
		colors: ColorSettings;
		isSpeakNames: boolean;
		defaultAlarm: string;
		description: string | null;
	}) => void;
}

export function TimerSettingsDialog({
	open,
	onOpenChange,
	timer,
	workoutItems,
	onSave,
}: TimerSettingsDialogProps) {
	const { data: userPreferences } = useUserPreferences();
	const [showColorHierarchy, setShowColorHierarchy] = useState(false);

	// Timer metadata
	const [category, setCategory] = useState<string>(
		timer?.category || TEMPLATE_CATEGORIES.CUSTOM,
	);
	const [icon, setIcon] = useState<string | null>(timer?.icon || null);
	const [color, setColor] = useState<string | null>(timer?.color || null);
	const [description, setDescription] = useState<string>(
		timer?.description || "",
	);

	// Timer settings
	const [colors, setColors] = useState<ColorSettings>(
		(timer?.colors as ColorSettings) ||
			userPreferences?.colors ||
			ADVANCED_TIMER_DEFAULT_COLORS,
	);
	const [isSpeakNames, setIsSpeakNames] = useState<boolean>(
		timer?.isSpeakNames ?? userPreferences?.isSpeakNames ?? true,
	);
	const [defaultAlarm, setDefaultAlarm] = useState<string>(
		timer?.defaultAlarm || userPreferences?.defaultAlarm || "beep-1x",
	);

	// Update state when timer or dialog opens
	useEffect(() => {
		if (open && timer) {
			setCategory(timer.category || TEMPLATE_CATEGORIES.CUSTOM);
			setIcon(timer.icon ?? null);
			setColor(timer.color ?? null);
			setDescription(timer.description || "");
			setColors(
				(timer.colors as ColorSettings) ||
					userPreferences?.colors ||
					ADVANCED_TIMER_DEFAULT_COLORS,
			);
			setIsSpeakNames(
				timer.isSpeakNames ?? userPreferences?.isSpeakNames ?? true,
			);
			setDefaultAlarm(
				timer.defaultAlarm || userPreferences?.defaultAlarm || "beep-1x",
			);
		}
	}, [open, timer, userPreferences]);

	const updateColor = (type: keyof ColorSettings, newColor: string) => {
		setColors((prev) => ({ ...prev, [type]: newColor }));
	};

	const handleSave = () => {
		onSave({
			category,
			icon,
			color,
			colors,
			isSpeakNames,
			defaultAlarm,
			description: description.trim() || null,
		});
		onOpenChange(false);
	};

	const handleResetColors = () => {
		if (userPreferences) {
			const clearedItems = clearItemLevelColors(workoutItems);
			mergeUserPreferences({ items: clearedItems }, userPreferences);
			setColors(userPreferences.colors);
			toast.success(
				"Reset workout colors to your defaults and cleared item-level overrides",
				{
					id: "reset-to-defaults",
				},
			);
		}
	};

	const handleDeleteItemColors = () => {
		clearItemLevelColors(workoutItems);
		toast.success("Deleted all item-level color overrides", {
			id: "delete-item-colors",
		});
	};

	const normalizedCategory = category || TEMPLATE_CATEGORIES.CUSTOM;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				title="Settings"
				className="max-h-[90vh] max-w-lg overflow-y-auto"
			>
				<DialogClose onClose={() => onOpenChange(false)} />

				<div className="space-y-6">
					{/* Timer Metadata */}
					<div className="space-y-4">
						<h3 className="text-base font-medium">Timer Information</h3>

						{/* Category */}
						<div className="space-y-2">
							<Label htmlFor="settings-category">Category</Label>
							<Select value={normalizedCategory} onValueChange={setCategory}>
								<SelectTrigger id="settings-category">
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

						{/* Icon */}
						<div className="space-y-2">
							<Label htmlFor="settings-icon">Icon</Label>
							<Select
								value={icon || "auto"}
								onValueChange={(value) =>
									setIcon(value === "auto" ? null : value)
								}
							>
								<SelectTrigger id="settings-icon">
									{icon && icon !== "auto" && ICON_MAP[icon] ? (
										<div className="flex items-center gap-2">
											{React.createElement(ICON_MAP[icon], {
												size: 16,
												className: "shrink-0",
											})}
											<span>{icon}</span>
										</div>
									) : (
										<SelectValue placeholder="Auto (by category)" />
									)}
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="auto">Auto (by category)</SelectItem>
									{Object.values(TIMER_CATEGORY_ICONS).map((iconName) => {
										const IconComponent = ICON_MAP[iconName];
										return (
											<SelectItem key={iconName} value={iconName}>
												<div className="flex items-center gap-2">
													{IconComponent && (
														<IconComponent size={16} className="shrink-0" />
													)}
													<span>{iconName}</span>
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</div>

						{/* Workout Icon Color */}
						<div className="space-y-2">
							<ColorPicker
								label="Workout Icon Color"
								value={color || ""}
								onChange={setColor}
							/>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="settings-description">
								Description{" "}
								<span className="text-xs text-muted-foreground">
									(optional)
								</span>
							</Label>
							<textarea
								id="settings-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Describe this timer..."
								className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
								maxLength={500}
							/>
						</div>
					</div>

					{/* Horizontal separator */}
					<hr className="border-border" />

					{/* Sound settings */}
					<div className="space-y-4">
						<h3 className="text-base font-medium">Alarm Sound</h3>

						<div className="flex gap-2">
							<Select
								value={defaultAlarm}
								onValueChange={(value) => {
									setDefaultAlarm(value);
									playSound(value);
								}}
							>
								<SelectTrigger className="flex-1">
									<SelectValue placeholder="Select alarm" />
								</SelectTrigger>
								<SelectContent>
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
								onClick={() => playSound(defaultAlarm)}
							>
								▶
							</Button>
						</div>
					</div>

					{/* Speak names toggle */}
					<div className="flex items-center gap-2">
						<Checkbox
							id="speak-names"
							checked={isSpeakNames}
							onCheckedChange={(checked) => setIsSpeakNames(!!checked)}
						/>
						<Label htmlFor="speak-names" className="text-sm">
							Speak interval names
						</Label>
					</div>

					{/* Horizontal separator */}
					<hr className="border-border" />

					{/* Color settings */}
					<div className="space-y-4">
						<h3 className="text-base font-medium">Interval Colors</h3>

						<ColorPicker
							label="Prepare Intervals"
							value={colors.prepare}
							onChange={(color) => updateColor("prepare", color)}
						/>

						<ColorPicker
							label="Work Intervals"
							value={colors.work}
							onChange={(color) => updateColor("work", color)}
						/>

						<ColorPicker
							label="Rest Intervals"
							value={colors.rest}
							onChange={(color) => updateColor("rest", color)}
						/>
					</div>

					<div className="space-y-4">
						<h3 className="text-base font-medium">Loop Colors</h3>

						<ColorPicker
							label="Main Loops"
							value={colors.loop}
							onChange={(color) => updateColor("loop", color)}
						/>

						<ColorPicker
							label="Nested Loops"
							value={colors.nestedLoop}
							onChange={(color) => updateColor("nestedLoop", color)}
						/>
					</div>

					{/* Color Hierarchy Explanation */}
					<div className="space-y-2 rounded-md border p-3">
						<button
							type="button"
							onClick={() => setShowColorHierarchy(!showColorHierarchy)}
							className="flex w-full items-center justify-between text-sm font-medium"
						>
							<span>How colors work</span>
							<span className="text-muted-foreground">
								{showColorHierarchy ? "−" : "+"}
							</span>
						</button>
						{showColorHierarchy && (
							<div className="space-y-2 pt-2 text-xs text-muted-foreground">
								<p className="font-medium text-foreground">
									Color Priority (highest to lowest):
								</p>
								<ol className="ml-4 list-decimal space-y-1">
									<li>
										<strong>Item/Set Level</strong> - Set in individual
										interval/loop settings dialogs
									</li>
									<li>
										<strong>Workout Level</strong> - Set in this dialog
									</li>
									<li>
										<strong>Your Defaults</strong> - Set in User Preferences
									</li>
									<li>
										<strong>System Defaults</strong> - Built-in fallback colors
									</li>
								</ol>
							</div>
						)}
					</div>

					{/* Reset Options */}
					<div className="space-y-3 pt-4">
						<div className="space-y-2">
							<p className="text-sm font-medium">Color Actions</p>
							<div className="flex flex-col gap-2">
								{userPreferences && (
									<Button
										onClick={handleResetColors}
										variant="default"
										className="w-full gap-2"
									>
										<RotateCcw size={16} />
										Reset workout colors to my default
									</Button>
								)}
								<Button
									onClick={handleDeleteItemColors}
									variant="destructive"
									className="w-full gap-2"
								>
									<Trash2 size={16} />
									Delete item colors
								</Button>
							</div>
						</div>
						<div className="flex gap-2 pt-2">
							<Button
								onClick={() => {
									onOpenChange(false);
									// Note: This will need to be handled by parent to open user preferences
								}}
								variant="outline"
								className="flex-1 gap-2"
							>
								<Settings size={16} />
								Manage My Defaults
							</Button>
							<Button onClick={handleSave} className="flex-1 gap-2">
								<Check size={16} />
								Done
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

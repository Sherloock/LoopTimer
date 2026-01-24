"use client";

import { Checkbox } from "@/components/timers/editor/advanced/dnd/checkbox";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useUpdateUserPreferences,
	useUserPreferences,
} from "@/hooks/use-user-preferences";
import { COLOR_SCHEMES, getColorScheme } from "@/lib/constants/color-schemes";
import { DEFAULT_USER_PREFERENCES } from "@/lib/constants/timers";
import { SoundSelector } from "@/components/ui/sound-selector";
import type { ColorSettings } from "@/types/advanced-timer";
import { Loader2, RotateCcw, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserPreferencesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function UserPreferencesDialog({
	open,
	onOpenChange,
}: UserPreferencesDialogProps) {
	const { data: preferences, isLoading } = useUserPreferences();
	const updatePreferences = useUpdateUserPreferences();

	const [selectedScheme, setSelectedScheme] = useState<string>("custom");
	const [colors, setColors] = useState<ColorSettings>(
		DEFAULT_USER_PREFERENCES.colors,
	);
	const [defaultAlarm, setDefaultAlarm] = useState<string>(
		DEFAULT_USER_PREFERENCES.defaultAlarm,
	);
	const [isSound, setIsSound] = useState<boolean>(
		DEFAULT_USER_PREFERENCES.isSound,
	);
	const [isSpeakNames, setIsSpeakNames] = useState<boolean>(
		DEFAULT_USER_PREFERENCES.isSpeakNames,
	);
	const [showResetConfirm, setShowResetConfirm] = useState(false);

	// Load preferences when dialog opens
	useEffect(() => {
		if (open && preferences) {
			setColors(preferences.colors);
			setDefaultAlarm(preferences.defaultAlarm);
			setIsSound(preferences.isSound);
			setIsSpeakNames(preferences.isSpeakNames);

			// Check if current colors match a preset
			const matchingScheme = COLOR_SCHEMES.find((scheme) => {
				return (
					scheme.colors.prepare === preferences.colors.prepare &&
					scheme.colors.work === preferences.colors.work &&
					scheme.colors.rest === preferences.colors.rest &&
					scheme.colors.loop === preferences.colors.loop &&
					scheme.colors.nestedLoop === preferences.colors.nestedLoop
				);
			});

			setSelectedScheme(matchingScheme ? matchingScheme.name : "custom");
		}
	}, [open, preferences]);

	const handleSchemeChange = (schemeName: string) => {
		setSelectedScheme(schemeName);
		if (schemeName === "custom") {
			return; // Keep current colors
		}

		const scheme = getColorScheme(schemeName);
		if (scheme) {
			setColors(scheme.colors);
		}
	};

	const handleSave = async () => {
		try {
			await updatePreferences.mutateAsync({
				colors,
				defaultAlarm,
				isSound,
				isSpeakNames,
			});
			toast.success("Preferences saved", { id: "save-preferences" });
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to save preferences",
				{ id: "save-preferences" },
			);
		}
	};

	const handleReset = () => {
		setColors(DEFAULT_USER_PREFERENCES.colors);
		setDefaultAlarm(DEFAULT_USER_PREFERENCES.defaultAlarm);
		setIsSound(DEFAULT_USER_PREFERENCES.isSound);
		setIsSpeakNames(DEFAULT_USER_PREFERENCES.isSpeakNames);
		setSelectedScheme("default");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				title="User Preferences"
				className="max-h-[90vh] max-w-2xl overflow-y-auto"
			>
				<DialogClose onClose={() => onOpenChange(false)} />

				{isLoading ? (
					<div className="space-y-6">
						<div className="space-y-4">
							<Skeleton className="h-6 w-32" />
							<div className="space-y-3">
								<Skeleton className="h-10 w-full rounded-md" />
								<Skeleton className="h-10 w-full rounded-md" />
							</div>
						</div>
						<div className="space-y-4">
							<Skeleton className="h-6 w-40" />
							<div className="space-y-3">
								<Skeleton className="h-10 w-full rounded-md" />
								<Skeleton className="h-10 w-full rounded-md" />
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-6">
						{/* Sound Settings */}
						<div className="space-y-4">
							<Label>Default Alarm Sound</Label>
							<SoundSelector
								value={defaultAlarm}
								onChange={(value) => value && setDefaultAlarm(value)}
							/>

							<div className="flex items-center gap-2">
								<Checkbox
									id="isSound"
									checked={isSound}
									onCheckedChange={(checked) => setIsSound(checked === true)}
								/>
								<Label htmlFor="isSound" className="text-sm">
									Enable sound (if disabled, timers start muted)
								</Label>
							</div>

							<div className="flex items-center gap-2">
								<Checkbox
									id="isSpeakNames"
									checked={isSpeakNames}
									onCheckedChange={(checked) =>
										setIsSpeakNames(checked === true)
									}
								/>
								<Label htmlFor="isSpeakNames" className="text-sm">
									Speak interval names
								</Label>
							</div>
						</div>

						{/* Color Scheme Selector */}
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>My Default Colors</Label>
								<p className="text-xs text-muted-foreground">
									These colors will be used as defaults for new workouts. Select
									a preset or customize below.
								</p>
							</div>
							<Select value={selectedScheme} onValueChange={handleSchemeChange}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select color scheme" />
								</SelectTrigger>
								<SelectContent>
									{COLOR_SCHEMES.map((scheme) => (
										<SelectItem key={scheme.name} value={scheme.name}>
											{scheme.label}
										</SelectItem>
									))}
									<SelectItem value="custom">Custom</SelectItem>
								</SelectContent>
							</Select>

							{/* Color Pickers - Always visible */}
							<div className="space-y-4 rounded-md border p-4">
								<ColorPicker
									label="Prepare Intervals"
									value={colors.prepare}
									onChange={(color) => setColors({ ...colors, prepare: color })}
								/>
								<ColorPicker
									label="Work Intervals"
									value={colors.work}
									onChange={(color) => setColors({ ...colors, work: color })}
								/>
								<ColorPicker
									label="Rest Intervals"
									value={colors.rest}
									onChange={(color) => setColors({ ...colors, rest: color })}
								/>
								<ColorPicker
									label="Loop Groups"
									value={colors.loop}
									onChange={(color) => setColors({ ...colors, loop: color })}
								/>
								<ColorPicker
									label="Nested Loops"
									value={colors.nestedLoop}
									onChange={(color) =>
										setColors({ ...colors, nestedLoop: color })
									}
								/>
							</div>
						</div>

						{/* Actions */}
						<div className="flex flex-col gap-4 pt-3 sm:flex-row sm:gap-2">
							<Button
								variant="outline"
								onClick={() => setShowResetConfirm(true)}
								className="flex-1 gap-2"
							>
								<RotateCcw size={16} />
								Reset to Defaults
							</Button>
							<Button
								variant="brand"
								onClick={handleSave}
								disabled={updatePreferences.isPending}
								className="flex-1 gap-2"
							>
								{updatePreferences.isPending ? (
									<>
										<Loader2 size={16} className="animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Save size={16} />
										Save Preferences
									</>
								)}
							</Button>
						</div>
					</div>
				)}
			</DialogContent>

			{/* Reset confirmation dialog */}
			{showResetConfirm && (
				<Dialog open={true} onOpenChange={() => setShowResetConfirm(false)}>
					<DialogContent title="Reset to defaults?" className="space-y-4">
						<p className="text-sm text-muted-foreground">
							This will reset all preferences to their default values.
						</p>
						<div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end sm:gap-2">
							<Button
								variant="outline"
								onClick={() => setShowResetConfirm(false)}
								className="gap-2"
							>
								<X size={16} />
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={() => {
									handleReset();
									setShowResetConfirm(false);
								}}
								className="gap-2"
							>
								<RotateCcw size={16} />
								Reset
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</Dialog>
	);
}

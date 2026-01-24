"use client";

import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SOUND_OPTIONS, playSound } from "@/lib/sound-utils";

const DEFAULT_OPTION_VALUE = "default";

interface SoundSelectorProps {
	value: string | undefined;
	onChange: (value: string | undefined) => void;
	placeholder?: string;
	/** When true, adds a "Default" option that maps to undefined */
	showDefaultOption?: boolean;
}

export function SoundSelector({
	value,
	onChange,
	placeholder = "Select sound",
	showDefaultOption = false,
}: SoundSelectorProps) {
	const handleValueChange = (newValue: string) => {
		if (showDefaultOption && newValue === DEFAULT_OPTION_VALUE) {
			onChange(undefined);
			playSound(undefined);
		} else {
			onChange(newValue);
			playSound(newValue);
		}
	};

	const handlePlayClick = () => {
		playSound(value);
	};

	const selectValue =
		showDefaultOption && value === undefined ? DEFAULT_OPTION_VALUE : value;

	return (
		<div className="flex gap-2">
			<Select value={selectValue} onValueChange={handleValueChange}>
				<SelectTrigger className="h-10 flex-1">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{showDefaultOption && (
						<SelectItem value={DEFAULT_OPTION_VALUE}>Default</SelectItem>
					)}
					{SOUND_OPTIONS.map((opt) => (
						<SelectItem key={opt.value} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Button
				className="size-10"
				variant="outline"
				size="icon"
				onClick={handlePlayClick}
			>
				<Play size={16} />
			</Button>
		</div>
	);
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatTimeInput, parseTimeInput } from "@/utils/timer-shared";
import { Minus, Plus } from "lucide-react";

interface TimeInputProps {
	value: number; // seconds
	onChange: (value: number) => void;
	min?: number;
	step?: number;
	className?: string;
	placeholder?: string;
	disabled?: boolean;
	id?: string;
}

export function TimeInput({
	value,
	onChange,
	min = 0,
	step = 5,
	className = "",
	placeholder = "0:00",
	disabled = false,
	id,
}: TimeInputProps) {
	const handleDecrement = () => {
		const newValue = Math.max(min, value - step);
		onChange(newValue);
	};

	const handleIncrement = () => {
		onChange(value + step);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = parseTimeInput(e.target.value);
		onChange(Math.max(min, newValue));
	};

	return (
		<div className={`flex items-center gap-[1px] ${className}`}>
			<Button
				variant="outline"
				size="icon"
				onClick={handleDecrement}
				disabled={disabled || value <= min}
				type="button"
			>
				<Minus size={16} />
			</Button>
			<Input
				id={id}
				type="text"
				value={formatTimeInput(value)}
				onChange={handleInputChange}
				className={cn(
					"w-24 px-4 py-3 text-center font-mono text-lg sm:w-16 sm:px-3 sm:py-2",
					className,
				)}
				placeholder={placeholder ?? "__:__"}
				disabled={disabled}
				inputMode="numeric" // mobile: show numeric keyboard
				pattern="[0-9:]*" // mobile: allow only numbers and colon
			/>
			<Button
				variant="outline"
				size="icon"
				onClick={handleIncrement}
				disabled={disabled}
				type="button"
			>
				<Plus size={16} />
			</Button>
		</div>
	);
}

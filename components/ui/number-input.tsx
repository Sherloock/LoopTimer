import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface NumberInputProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	className?: string;
	placeholder?: string;
	disabled?: boolean;
	id?: string;
}

export function NumberInput({
	value,
	onChange,
	min = 0,
	max = Infinity,
	step = 1,
	className = "",
	placeholder,
	disabled = false,
	id,
}: NumberInputProps) {
	const handleDecrement = () => {
		const newValue = Math.max(min, value - step);
		onChange(newValue);
	};

	const handleIncrement = () => {
		const newValue = Math.min(max, value + step);
		onChange(newValue);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = parseInt(e.target.value) || min;
		onChange(Math.max(min, Math.min(max, newValue)));
	};

	const wrapperClassName = cn("flex items-center gap-[1px]");
	const inputClassName = cn(
		"text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
		className,
	);
	return (
		<div className={wrapperClassName}>
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
				type="number"
				value={value}
				onChange={handleInputChange}
				className={inputClassName}
				placeholder={placeholder}
				disabled={disabled}
				min={min}
				max={max}
			/>
			<Button
				variant="outline"
				size="icon"
				onClick={handleIncrement}
				disabled={disabled || value >= max}
				type="button"
			>
				<Plus size={16} />
			</Button>
		</div>
	);
}

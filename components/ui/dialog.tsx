import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
}

interface DialogContentProps {
	children: React.ReactNode;
	title?: string;
	className?: string;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onOpenChange(false);
			}
		};

		if (open) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [open, onOpenChange]);

	if (!open) return null;

	return createPortal(
		<div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={() => onOpenChange(false)}
			/>
			<div className="relative z-10 w-full max-w-md">{children}</div>
		</div>,
		document.body,
	);
}

export function DialogContent({
	children,
	title,
	className = "",
}: DialogContentProps) {
	const contentRef = useRef<HTMLDivElement>(null);

	return (
		<div
			ref={contentRef}
			className={`relative mx-auto max-h-[90vh] w-full overflow-y-auto rounded-lg border bg-background p-6 shadow-lg ${className}`}
		>
			{title && (
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold">{title}</h2>
				</div>
			)}
			{children}
		</div>
	);
}

export function DialogTrigger({
	children,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return <Button {...props}>{children}</Button>;
}

export function DialogClose({
	children,
	onClose,
}: {
	children?: React.ReactNode;
	onClose: () => void;
}) {
	return (
		<Button
			variant="outline"
			size="icon"
			onClick={onClose}
			className="absolute right-4 top-4"
		>
			{children || <X size={16} />}
		</Button>
	);
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Check, Copy, Download, Loader2, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import type { AdvancedConfig } from "@/types/advanced-timer";

interface ShareDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	timerName: string;
	timerData: AdvancedConfig;
	timerDescription?: string | null;
}

export function ShareDialog({
	open,
	onOpenChange,
	timerName,
	timerData,
	timerDescription,
}: ShareDialogProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [shareUrl, setShareUrl] = useState<string | null>(null);
	const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
	const [expiresIn, setExpiresIn] = useState<string>("never");
	const [isCopied, setIsCopied] = useState(false);

	const handleCreateShareLink = async () => {
		setIsCreating(true);
		try {
			const expiresInDays =
				expiresIn === "never" ? null : parseInt(expiresIn, 10);

			const response = await fetch("/api/shared", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: timerName,
					data: timerData,
					expiresInDays,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create share link");
			}

			const sharedTimer = await response.json();
			const url = `${window.location.origin}/shared/${sharedTimer.id}`;
			setShareUrl(url);

			// Generate QR code
			const qrDataUrl = await QRCode.toDataURL(url, {
				width: 300,
				margin: 2,
			});
			setQrCodeDataUrl(qrDataUrl);

			toast.success("Share link created!");
		} catch (error) {
			toast.error("Failed to create share link");
		} finally {
			setIsCreating(false);
		}
	};

	const handleCopyLink = async () => {
		if (!shareUrl) return;

		try {
			await navigator.clipboard.writeText(shareUrl);
			setIsCopied(true);
			toast.success("Link copied to clipboard!");
			setTimeout(() => setIsCopied(false), 2000);
		} catch (error) {
			toast.error("Failed to copy link");
		}
	};

	const handleDownloadQR = () => {
		if (!qrCodeDataUrl) return;

		const link = document.createElement("a");
		link.download = `${timerName.replace(/[^a-z0-9]/gi, "_")}_qr.png`;
		link.href = qrCodeDataUrl;
		link.click();
	};

	// Reset state when dialog closes
	useEffect(() => {
		if (!open) {
			setShareUrl(null);
			setQrCodeDataUrl(null);
			setIsCopied(false);
			setExpiresIn("never");
		}
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Share2 className="h-5 w-5" />
						Share Timer
					</DialogTitle>
					<DialogDescription>
						Create a shareable link with a QR code for easy access
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Timer Description */}
					{timerDescription && (
						<div className="space-y-2 rounded-md border bg-muted/50 p-3">
							<Label className="text-xs text-muted-foreground">
								Description
							</Label>
							<p className="text-sm">{timerDescription}</p>
						</div>
					)}
					{!shareUrl ? (
						<>
							{/* Expiration Settings */}
							<div className="space-y-2">
								<Label htmlFor="expires">Link expires in</Label>
								<Select value={expiresIn} onValueChange={setExpiresIn}>
									<SelectTrigger id="expires">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="7">7 days</SelectItem>
										<SelectItem value="30">30 days</SelectItem>
										<SelectItem value="90">90 days</SelectItem>
										<SelectItem value="never">Never</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Create Button */}
							<Button
								onClick={handleCreateShareLink}
								disabled={isCreating}
								className="w-full"
							>
								{isCreating ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									<>
										<Share2 className="mr-2 h-4 w-4" />
										Create Share Link
									</>
								)}
							</Button>
						</>
					) : (
						<>
							{/* Share URL */}
							<div className="space-y-2">
								<Label htmlFor="share-url">Share Link</Label>
								<div className="flex gap-2">
									<Input
										id="share-url"
										value={shareUrl}
										readOnly
										className="flex-1"
									/>
									<Button
										onClick={handleCopyLink}
										variant="outline"
										size="icon"
										className="shrink-0"
									>
										{isCopied ? (
											<Check className="h-4 w-4" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>

							{/* QR Code */}
							{qrCodeDataUrl && (
								<div className="space-y-2">
									<Label>QR Code</Label>
									<div className="flex flex-col items-center gap-2 rounded-lg border bg-white p-4">
										<Image
											src={qrCodeDataUrl}
											alt="QR Code"
											width={250}
											height={250}
											className="h-[250px] w-[250px]"
										/>
										<Button
											onClick={handleDownloadQR}
											variant="outline"
											size="sm"
											className="w-full"
										>
											<Download className="mr-2 h-4 w-4" />
											Download QR Code
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

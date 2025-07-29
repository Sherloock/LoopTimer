"use client";

import { Clock } from "@/components/clock";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClockPage() {
	const router = useRouter();
	const [isFullscreen, setIsFullscreen] = useState(false);

	const toggleFullscreen = async () => {
		try {
			if (
				!document.fullscreenElement &&
				!document.webkitFullscreenElement &&
				!document.mozFullScreenElement
			) {
				// Request fullscreen
				const element = document.documentElement;
				if (element.requestFullscreen) {
					await element.requestFullscreen();
				} else if (element.webkitRequestFullscreen) {
					await element.webkitRequestFullscreen();
				} else if (element.mozRequestFullScreen) {
					await element.mozRequestFullScreen();
				}
			} else {
				// Exit fullscreen
				if (document.exitFullscreen) {
					await document.exitFullscreen();
				} else if (document.webkitExitFullscreen) {
					await document.webkitExitFullscreen();
				} else if (document.mozCancelFullScreen) {
					await document.mozCancelFullScreen();
				}
			}
		} catch (error) {
			console.error("Error toggling fullscreen:", error);
		}
	};

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(
				!!document.fullscreenElement ||
					!!document.webkitFullscreenElement ||
					!!document.mozFullScreenElement,
			);
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
		document.addEventListener("mozfullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
			document.removeEventListener(
				"webkitfullscreenchange",
				handleFullscreenChange,
			);
			document.removeEventListener(
				"mozfullscreenchange",
				handleFullscreenChange,
			);
		};
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
			<div className="fixed right-0 top-0 h-screen w-screen">
				<Clock />
			</div>
			<div className="fixed left-4 top-4 z-50">
				<Button variant="ghost" size="icon" onClick={() => router.push("/app")}>
					<ArrowLeft size={20} />
				</Button>
			</div>
			<div className="fixed right-4 top-4 z-50">
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleFullscreen}
					title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
				>
					{isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
				</Button>
			</div>
		</div>
	);
}

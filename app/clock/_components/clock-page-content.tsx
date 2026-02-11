"use client";

import { Clock } from "@/components/clock/clock";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/lib/navigation";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState } from "react";

export function ClockPageContent() {
	const { goToMenu } = useNavigation();
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
			{/* Mobile: thumb-reachable back button */}
			<Button
				variant="outline"
				size="icon"
				className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-background/80 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
				onClick={goToMenu}
			>
				<ArrowLeft size={20} />
				<span className="sr-only">Back to menu</span>
			</Button>

			{/* Desktop: keep back button near top-left */}
			<div className="fixed left-4 top-4 z-50 hidden md:block">
				<Button variant="ghost" size="icon" onClick={goToMenu}>
					<ArrowLeft size={20} />
					<span className="sr-only">Back to menu</span>
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

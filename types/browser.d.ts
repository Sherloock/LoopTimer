interface Document {
	webkitFullscreenElement?: Element | null;
	mozFullScreenElement?: Element | null;
	webkitExitFullscreen?: () => Promise<void>;
	mozCancelFullScreen?: () => Promise<void>;
}

interface HTMLElement {
	webkitRequestFullscreen?: () => Promise<void>;
	mozRequestFullScreen?: () => Promise<void>;
}

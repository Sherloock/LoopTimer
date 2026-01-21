"use client";

import { AdvancedTimer } from "@/components/timers/editor/advanced/advanced-timer";
import type { ComponentProps } from "react";

// Re-export a pared-down editing variant of AdvancedTimer
// that hides playback controls and only exposes save functionality.
export function EditTimer(props: ComponentProps<typeof AdvancedTimer>) {
	return <AdvancedTimer {...props} editMode />;
}

export default EditTimer;

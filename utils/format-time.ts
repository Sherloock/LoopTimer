export const formatTime = (seconds: number): string => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const formatTimeWithLabel = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	if (hours > 0) {
		if (mins > 0) {
			return `${hours}h ${mins}m`;
		}
		return `${hours}h`;
	}

	if (mins > 0) {
		if (secs > 0) {
			return `${mins}m ${secs}s`;
		}
		return `${mins}m`;
	}

	return `${secs}s`;
};

export const formatTimeCompact = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	if (hours > 0) {
		const remainingMins = mins > 0 ? ` ${mins}m` : "";
		return `${hours}h${remainingMins}`;
	}

	if (mins >= 60) {
		return `${Math.floor(mins / 60)}h ${mins % 60}m`;
	}

	return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatTimeMinutes = (seconds: number): string => {
	const totalMinutes = Math.round(seconds / 60);
	return `${totalMinutes} min`;
};

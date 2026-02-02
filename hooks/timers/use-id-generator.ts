import { ADVANCED_TIMER_DEFAULT_NEXT_ID } from "@/lib/constants/timers";
import { useCallback, useEffect, useRef, useState } from "react";

export function useIdGenerator(
	initialNextId: number = ADVANCED_TIMER_DEFAULT_NEXT_ID,
) {
	const [nextId, setNextId] = useState(initialNextId);

	// Keep a ref in sync with nextId state to guarantee synchronous, unique ID generation
	const nextIdRef = useRef(nextId);

	// Ensure ref stays updated when state changes externally (e.g., when loading a saved timer)
	useEffect(() => {
		nextIdRef.current = nextId;
	}, [nextId]);

	// Generate a unique string ID. Using the functional
	// updater form guarantees each invocation within the same
	// render gets an up-to-date value, avoiding duplicates.
	const generateId = useCallback(() => {
		const id = nextIdRef.current.toString();
		nextIdRef.current += 1;
		setNextId(nextIdRef.current); // keep state in sync for debugging & future loads
		return id;
	}, []);

	return { nextId, setNextId, generateId };
}

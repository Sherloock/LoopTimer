"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from "react";

interface LoadingContextType {
	isLoading: (key: string) => boolean;
	setLoading: (key: string, loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
	const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
		{},
	);

	const setLoading = useCallback((key: string, loading: boolean) => {
		setLoadingStates((prev) => {
			if (prev[key] === loading) return prev;
			return { ...prev, [key]: loading };
		});
	}, []);

	const isLoading = useCallback(
		(key: string) => {
			return loadingStates[key] ?? false;
		},
		[loadingStates],
	);

	return (
		<LoadingContext.Provider value={{ isLoading, setLoading }}>
			{children}
		</LoadingContext.Provider>
	);
}

export function useLoadingContext() {
	const context = useContext(LoadingContext);
	if (!context) {
		throw new Error("useLoadingContext must be used within LoadingProvider");
	}
	return context;
}

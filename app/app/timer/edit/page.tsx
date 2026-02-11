import { Suspense } from "react";
import { EditTimerContent } from "./_components/edit-timer-content";

export default function EditTimerPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-1">
			<Suspense
				fallback={
					<div className="container mx-auto max-w-4xl px-0">
						Loading editor...
					</div>
				}
			>
				<EditTimerContent />
			</Suspense>
		</div>
	);
}

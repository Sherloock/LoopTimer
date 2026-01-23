import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TemplateCardSkeleton() {
	return (
		<Card className="flex h-full flex-col">
			<CardHeader>
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 space-y-2">
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-4 w-full" />
					</div>
					<Skeleton className="h-6 w-16 shrink-0 rounded-md" />
				</div>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col justify-end space-y-4">
				{/* Timeline Preview Skeleton */}
				<div className="space-y-2">
					<Skeleton className="h-12 w-full rounded-md" />
					<div className="flex gap-1">
						<Skeleton className="h-2 flex-1 rounded" />
						<Skeleton className="h-2 flex-1 rounded" />
						<Skeleton className="h-2 flex-1 rounded" />
						<Skeleton className="h-2 flex-1 rounded" />
					</div>
				</div>

				{/* Stats Skeleton */}
				<div className="flex items-center gap-4">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-24" />
				</div>

				{/* Button Skeleton */}
				<Skeleton className="h-10 w-full rounded-md" />
			</CardContent>
		</Card>
	);
}

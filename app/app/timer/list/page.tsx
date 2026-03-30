import { getTimers } from "@/actions/timers/getTimers";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { TimersListPageContent } from "./_components/timers-list-page-content";

export default async function TimersListPage() {
	const queryClient = new QueryClient();
	const timers = await getTimers();
	queryClient.setQueryData(QUERY_KEYS.TIMERS, timers);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TimersListPageContent />
		</HydrationBoundary>
	);
}

import { queryOptions } from "@tanstack/react-query";
import { client } from "@/orpc/client";
import { MS_PER_SECOND } from "@/utils/constants";

const STALE_TIME_MINUTES = 5;
const GC_TIME_MINUTES = 10;
const STALE_TIME_MS = STALE_TIME_MINUTES * MS_PER_SECOND;
const GC_TIME_MS = GC_TIME_MINUTES * MS_PER_SECOND;

export function sessionQueryOptions() {
	return queryOptions({
		queryKey: ["auth", "session"],
		queryFn: () => client.auth.getSession(),
		staleTime: STALE_TIME_MS,
		gcTime: GC_TIME_MS,
	});
}

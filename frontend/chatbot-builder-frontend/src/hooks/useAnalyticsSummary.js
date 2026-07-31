import { useQuery } from "@tanstack/react-query";
import { getAnalyticsSummary } from "../api/analytics";

function useAnalyticsSummary(botId) {
    return useQuery({
        queryKey: ['analytics-summary', botId],
        queryFn: () => getAnalyticsSummary(botId),
        enabled: !!botId
    })
}

export default useAnalyticsSummary;
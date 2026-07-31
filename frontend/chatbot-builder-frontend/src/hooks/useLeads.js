import { useQuery } from "@tanstack/react-query";
import { getLeads } from "@/api/leads";

export function useLeads(botId) {
    return useQuery({
        queryKey: ['leads', botId],
        queryFn: () => getLeads(botId),
        enabled: !!botId,
    })
}
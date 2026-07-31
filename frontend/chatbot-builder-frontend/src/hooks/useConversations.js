import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/api/conversations";

export function useConversations(botId) {
    return useQuery({
        queryKey: ['conversations', botId],
        queryFn: () => getConversations(botId),
        enabled: !!botId
    })
}
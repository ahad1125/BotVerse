import { useQuery } from "@tanstack/react-query";
import { getConversationMessages } from "../api/chats";

function useConversationMessages(botId, conversationId) {
    return useQuery({
        queryKey: ['conversation-messages', botId, conversationId],
        queryFn: () => getConversationMessages(botId, conversationId),
        enabled: !!conversationId
    })
}

export default useConversationMessages;
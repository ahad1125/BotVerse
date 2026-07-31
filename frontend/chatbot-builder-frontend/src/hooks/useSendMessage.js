import { sendChatMessage } from "../api/chats";
import { useMutation } from '@tanstack/react-query';

function useSendMessage(botId) {
    return useMutation({
        mutationFn: (payload) => sendChatMessage(botId, payload),
    });
}

export default useSendMessage;
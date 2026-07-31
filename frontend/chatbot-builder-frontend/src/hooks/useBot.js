import { useQuery } from "@tanstack/react-query";
import { getBot } from "../api/bots";

function useBot(botId) {
    return useQuery({
        queryKey: ['bot', botId],
        queryFn: () => getBot(botId),
        enabled: !!botId,
    })
}

export default useBot;
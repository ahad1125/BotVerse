import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBot } from "../api/bots";

function useUpdateBot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ botId, botData }) => updateBot(botId, botData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bots"] });
            queryClient.invalidateQueries({ queryKey: ["bot"] });
        },
    });
}

export default useUpdateBot;
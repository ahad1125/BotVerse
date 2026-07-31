import { useMutation, useQueryClient } from "@tanstack/react-query";
import { retryKnowledgeSource } from "../api/knowledgeSources";

function useRetryKnowledgeSource(botId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sourceId) => retryKnowledgeSource(botId, sourceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge-sources', botId] });
        },
    });
}

export default useRetryKnowledgeSource;
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createKnowledgeSource } from "../api/knowledgeSources";

export function useCreateKnowledgeSources(botId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) =>
            createKnowledgeSource(botId, formData),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["knowledge-sources", botId],
            });
        },
    });
}


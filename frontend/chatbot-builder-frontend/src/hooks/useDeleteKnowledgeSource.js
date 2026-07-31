import { deleteKnowledgeSource } from "../api/knowledgeSources";
import { useQueryClient, useMutation } from "@tanstack/react-query";



function useDeleteKnowledgeSource(botId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (knowledgeSourceId) => deleteKnowledgeSource(botId, knowledgeSourceId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['knowledge-sources', botId]
            })
        }

    })

}

export default useDeleteKnowledgeSource
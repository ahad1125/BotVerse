import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getKnowledgeSources } from "../api/knowledgeSources";



function useKnowledgeSources(botId) {
    return useQuery(
        {
            queryKey: ['knowledge-sources', botId],
            queryFn: () => getKnowledgeSources(botId),
            enabled: !!botId,
            refetchInterval: (query) => {
                const sources = query.state.data?.data;
                const stillProcessing = sources?.some(
                    ks => ks.status === 'pending' || ks.status === 'processing'
                );
                return stillProcessing ? 2000 : false;
            }
        }
    )

}

export default useKnowledgeSources

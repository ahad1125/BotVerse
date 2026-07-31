import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { getQuickReplies, deleteQuickReply, createQuickReply } from "../api/quickReplies";


export function useQuickReplies(botId) {
    return useQuery({
        queryKey: ['quick-replies', botId],
        queryFn: () => getQuickReplies(botId),
        enabled: !!botId,
    });
}

export function useCreateQuickReply(botId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (text) => createQuickReply(botId, text),
        onSuccess: () => qc.invalidateQueries({
            queryKey: ['quick-replies', botId]
        })
    })
}

export function useDeleteQuickReply(botId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteQuickReply(botId, id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["quick-replies", botId] }),
    });
}
import React from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { deleteBot } from '../api/bots'


function useDeleteBot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (botId) => deleteBot(botId),


        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['bots'],
            })
        }
    })
}

export default useDeleteBot
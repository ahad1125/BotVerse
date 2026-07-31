import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBot } from "../api/bots";


function useCreateBot() {

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: createBot,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['bots'],
            })
        }
    });
    return mutation;
}

export default useCreateBot;
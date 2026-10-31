import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            staleTime: 1000 * 10, // 10 seconds instead of 5 minutes
        },
    },
})

export default queryClient;

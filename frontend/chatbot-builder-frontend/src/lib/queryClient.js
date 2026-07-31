import { QueryClient } from '@tanstack/react-query'


const queryClient = new QueryClient({
    defaultOptions: {
        queries: { // get requests
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,

        }, //mutuations -> post,put,delete
    },
})

export default queryClient;

// From now on, instead of writing:

// useEffect(() => {
//   fetchBots();
// }, []);

// you'll write:

// const { data, isLoading, error } = useBots();
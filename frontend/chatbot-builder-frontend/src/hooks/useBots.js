// hooks/ → "How do React components use that API?"

import { useQuery } from "@tanstack/react-query";
import { getBots } from "../api/bots";



export const useBots = () => {


    return useQuery({
        queryKey: ['bots'],
        queryFn: getBots,
    })
}

// What does this return?

// This is the magic of React Query.

// Later inside Dashboard.jsx you'll simply write:

// const {
//     data,
//     isLoading,
//     error,
// } = useBots();

// No:

// useEffect
// fetch
// axios
// loading state
// error state

// React Query manages all of that for you.
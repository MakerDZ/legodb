import { getAPIUseCase } from '@/use-cases/api';
import { useQuery } from '@tanstack/react-query';

const useApiData = () => {
    const apiQuery = async () => {
        const api = await getAPIUseCase();
        return api;
    };

    const {
        data: apiData,
        isLoading: isApiLoading,
        error: ApiError,
        refetch: apiRefetch,
    } = useQuery({
        queryKey: ['apidata'],
        queryFn: () => apiQuery(),
        refetchOnMount: false,
        staleTime: Infinity,
    });

    return {
        apiData,
        isApiLoading,
        ApiError,
        apiRefetch,
    };
};

export default useApiData;

import { getApiTokenUsecase } from '@/use-cases/apitoken';
import { useQuery } from '@tanstack/react-query';

const useApiTokenData = () => {
    const apiTokensQuery = async () => {
        const apitokens = await getApiTokenUsecase();
        return apitokens;
    };

    const {
        data: apitokenData,
        isLoading: isApiTokenLoading,
        error: ApiTokenError,
        refetch: apiTokenRefetch,
    } = useQuery({
        queryKey: ['apitokensdata'],
        queryFn: () => apiTokensQuery(),
        refetchOnMount: false,
        staleTime: Infinity,
    });

    return {
        apitokenData,
        isApiTokenLoading,
        ApiTokenError,
        apiTokenRefetch,
    };
};

export default useApiTokenData;

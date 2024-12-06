import { getAPIUseCase } from '@/use-cases/api';
import { getWebHookUseCase } from '@/use-cases/webhook';
import { useQuery } from '@tanstack/react-query';

const useWebHookData = () => {
    const WebHookQuery = async () => {
        const webhook = await getWebHookUseCase();
        return webhook;
    };

    const {
        data: WebHookData,
        isLoading: isWebHookLoading,
        error: WebHookError,
        refetch: apiRefetch,
    } = useQuery({
        queryKey: ['webHook'],
        queryFn: () => WebHookQuery(),
        refetchOnMount: false,
        staleTime: Infinity,
    });

    return {
        WebHookData,
        isWebHookLoading,
        WebHookError,
        apiRefetch,
    };
};

export default useWebHookData;

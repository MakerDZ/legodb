import { TableAccessToken, WebHook } from '@prisma/client';
import { QueryClient } from '@tanstack/react-query';

export const useWebHookCatchUpdate = (queryClient: QueryClient) => {
    const setWebHook = (newWebHook: WebHook) => {
        queryClient.setQueryData(['webHook'], (data: WebHook[] = []) => {
            return [...data, newWebHook];
        });
    };

    const deleteWebhook = (deletedWebhook: WebHook) => {
        queryClient.setQueryData(['webHook'], (data: WebHook[] = []) => {
            const updatedWebook = data.filter(
                (coll) => coll.id != deletedWebhook.id
            );
            return updatedWebook;
        });
    };

    return {
        setWebHook,
        deleteWebhook,
    };
};

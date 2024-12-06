import { TypeAPiTokenSchema } from '@/validation/API-Token';
import { GodAccessToken } from '@prisma/client';
import { QueryClient } from '@tanstack/react-query';

export const useApiTokenCatchUpdate = (queryClient: QueryClient) => {
    const setApiToken = (newApiToken: TypeAPiTokenSchema) => {
        queryClient.setQueryData(
            ['apitokensdata'],
            (data: TypeAPiTokenSchema[] = []) => {
                return [...data, newApiToken];
            }
        );
    };

    const deleteApiToken = (deletedToken: GodAccessToken) => {
        queryClient.setQueryData(
            ['apitokensdata'],
            (data: GodAccessToken[] = []) => {
                const updatedapiToken = data.filter(
                    (coll) => coll.id != deletedToken.id
                );
                return updatedapiToken;
            }
        );
    };

    return {
        setApiToken,
        deleteApiToken,
    };
};

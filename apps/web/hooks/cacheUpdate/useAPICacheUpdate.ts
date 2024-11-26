import { TableAccessToken } from '@prisma/client';
import { QueryClient } from '@tanstack/react-query';

export const useAPICatchUpdate = (queryClient: QueryClient) => {
    const setAPI = (newAPI: TableAccessToken) => {
        queryClient.setQueryData(
            ['apidata'],
            (data: TableAccessToken[] = []) => {
                return [...data, newAPI];
            }
        );
    };

    const deleteAPI = (deletedToken: TableAccessToken) => {
        queryClient.setQueryData(
            ['apidata'],
            (data: TableAccessToken[] = []) => {
                const updatedapiToken = data.filter(
                    (coll) => coll.id != deletedToken.id
                );
                return updatedapiToken;
            }
        );
    };

    return {
        setAPI,
        deleteAPI,
    };
};

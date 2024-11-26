import { QueryClient } from '@tanstack/react-query';

interface ICollection {
    id: string;
    name: string;
}

export const useCollectionCatheUpdate = (queryClient: QueryClient) => {
    const setCollection = (newCollectionData: ICollection) => {
        queryClient.setQueryData(
            ['collectiondata'],
            (data: ICollection[] = []) => {
                return [...data, newCollectionData];
            }
        );
    };

    const updateCollection = (updatedCollection: ICollection) => {
        queryClient.setQueryData(
            ['collectiondata'],
            (data: ICollection[] = []) => {
                const updated = data.map((collection) => {
                    if (collection.id == updatedCollection.id) {
                        return updatedCollection;
                    }
                    return collection;
                });
                return updated;
            }
        );
    };

    const deleteCollection = (deletedCollection: ICollection) => {
        queryClient.setQueryData(
            ['collectiondata'],
            (data: ICollection[] = []) => {
                const updatedCollection = data.filter(
                    (coll) => coll.id != deletedCollection.id
                );
                return updatedCollection;
            }
        );
    };

    return {
        setCollection,
        deleteCollection,
        updateCollection,
    };
};

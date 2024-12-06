import { getCollectionsUseCase } from '@/use-cases/collection';
import { useQuery } from '@tanstack/react-query';

const useCollectionData = () => {
    const collectionJobQuery = async () => {
        const collection = await getCollectionsUseCase();
        return collection;
    };

    const {
        data: collectionData,
        isLoading: isCollectionLoading,
        error: collectionError,
        refetch: collectionRefetch,
    } = useQuery({
        queryKey: ['collectiondata'],
        queryFn: () => collectionJobQuery(),
        refetchOnMount: false,
        staleTime: Infinity,
    });

    return {
        collectionData,
        isCollectionLoading,
        collectionError,
        collectionRefetch,
    };
};
export default useCollectionData;

import { assertAuthenticated } from '@/lib/session';
import { getUserProfileUseCase } from '@/use-cases/users';
import { useQuery } from '@tanstack/react-query';

const useUserProfile = () => {
    const fetchUserProfile = async () => {
        const user = await assertAuthenticated();
        const profile = await getUserProfileUseCase(user.user.id);
        return { profile, role: user.role };
    };

    const {
        data: userData,
        isLoading: isUserLoading,
        error: userError,
        refetch: refetchUser,
    } = useQuery({
        queryKey: ['userProfile'],
        queryFn: fetchUserProfile,
        refetchOnMount: false,
        staleTime: Infinity,
    });

    return {
        profile: userData?.profile,
        role: userData?.role,
        isUserLoading,
        userError,
        refetchUser,
    };
};

export default useUserProfile;

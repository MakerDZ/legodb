import { Suspense } from 'react';
import SettingNav from './_components/SettingNav';
import SettingLoading from './loading';
import { getUserRoleUseCase } from '@/use-cases/users';

const SettingLayout = async ({ children }: { children: React.ReactNode }) => {
    const role = await getUserRoleUseCase();

    if (!role) {
        return null;
    }

    return (
        <div className="flex flex-row  ">
            <SettingNav role={role} />
            <Suspense fallback={<SettingLoading />}>
                <div className="p-8 w-full">{children}</div>
            </Suspense>
        </div>
    );
};

export default SettingLayout;

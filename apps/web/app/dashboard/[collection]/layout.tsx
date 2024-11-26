import { getCurrentUser } from '@/lib/session';
import CollectionNav from './collectionNav';
import { getUserRoleUseCase } from '@/use-cases/users';

export interface IDashboardNav {
    name: string;
    route: string;
}

const CollectionLayout = async ({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { collection: string };
}) => {
    const godAccess: IDashboardNav[] = [
        { name: 'Database', route: `/dashboard/${params.collection}/database` },
        {
            name: 'Dashboard',
            route: `/dashboard/${params.collection}/dashboard`,
        },
        { name: 'API', route: `/dashboard/${params.collection}/api` },
        { name: 'Webhooks', route: `/dashboard/${params.collection}/webhooks` },
    ];

    const entryAccess: IDashboardNav[] = [
        {
            name: 'Dashboard',
            route: `/dashboard/${params.collection}/dashboard`,
        },
    ];

    const role = await getUserRoleUseCase();

    const dashboardNav = role === 'God' ? godAccess : entryAccess;

    return (
        <div className="w-full relative">
            <CollectionNav dashboardNav={dashboardNav} />
            {children}
        </div>
    );
};

export default CollectionLayout;

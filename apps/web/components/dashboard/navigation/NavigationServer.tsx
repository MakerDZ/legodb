import NavigationClient from './NavigationClient';

import { assertAuthenticated } from '@/lib/session';
import { getUserProfileUseCase } from '@/use-cases/users';

const Navigation = () => {
    return <NavigationClient />;
};

export default Navigation;

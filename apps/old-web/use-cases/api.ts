'use server';

import { TypeAPiToken } from '@/validation/API-Token';
import { Iauth } from './collection';
import { Restrictet } from '@/utils/handler';
import { generateSecureToken } from '@/lib/helper';
import { createApi, deleteApi, getApi } from '@/data-access/api';

export async function createApiUseCase(input: TypeAPiToken, auth: Iauth) {
    await Restrictet(auth.role);

    const token = generateSecureToken();

    const api = await createApi(input, token);

    return api;
}

export async function getAPIUseCase() {
    const apiList = await getApi();

    return apiList;
}

export async function deleteApiUseCase(token: string) {
    const apiToken = await deleteApi(token);

    return apiToken;
}

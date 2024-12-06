'use server';

import { TypeAPiTokenSchema } from '@/validation/API-Token';
import { Iauth } from './collection';
import { Restrictet } from '@/utils/handler';
import {
    createApiToken,
    deleteApiToken,
    getApiTokens,
} from '@/data-access/ApiToken';
import { generateSecureToken } from '@/lib/helper';

export async function createApiTokenUseCase(
    input: TypeAPiTokenSchema,
    auth: Iauth
) {
    await Restrictet(auth.role);

    const token = generateSecureToken();

    const apiToken = await createApiToken(input, token);

    return apiToken;
}

export async function getApiTokenUsecase() {
    const apiTokenList = await getApiTokens();

    return apiTokenList;
}

export async function deleteApiTokenUseCase(token: string) {
    const apiToken = await deleteApiToken(token);

    return apiToken;
}

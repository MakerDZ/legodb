'use server';

import { actionClient } from '@/lib/safe-action';
import { APIToken } from '@/validation/API-Token';

import { InputParseError } from '@/entities/errors/common';
import { applyRateLimit, handleCommonErrors } from '@/utils/handler';
import { assertAuthenticated } from '@/lib/session';
import { createApiUseCase, deleteApiUseCase } from '@/use-cases/api';

export const createAPIAction = actionClient
    .schema(APIToken)
    .action(
        async ({
            parsedInput: { name, tableAccess, actionAccessLevel, databaseID },
        }) => {
            try {
                const { data, error: inputParserError } = APIToken.safeParse({
                    name,
                    actionAccessLevel,
                    tableAccess,
                    databaseID,
                });
                if (inputParserError) {
                    throw new InputParseError('Invalid Error', {
                        cause: inputParserError,
                    });
                }
                //await applyRateLimit('create-api', 10, 60000);
                const authUser = await assertAuthenticated();
                const api = await createApiUseCase(data, authUser);
                return {
                    data: api,
                    status: 'success',
                    error: null,
                };
            } catch (error) {
                const handleError = await handleCommonErrors(error);
                return {
                    data: null,
                    stauts: 'failed',
                    error: handleError.error,
                };
            }
        }
    );

export const deleteAPIAction = async (token: string) => {
    const api = await deleteApiUseCase(token);

    return api;
};
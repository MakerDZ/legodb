'use server';

import { InputParseError } from '@/entities/errors/common';

import { actionClient } from '@/lib/safe-action';
import { assertAuthenticated } from '@/lib/session';
import {
    createApiTokenUseCase,
    deleteApiTokenUseCase,
} from '@/use-cases/apitoken';
import { applyRateLimit, handleCommonErrors } from '@/utils/handler';
import { APITokenSchema } from '@/validation/API-Token';

export const createApiTokenAction = actionClient
    .schema(APITokenSchema)
    .action(
        async ({
            parsedInput: { name, actionAccessLevel, dataAccessLevel },
        }) => {
            try {
                const { data, error: inputParserError } =
                    APITokenSchema.safeParse({
                        name,
                        actionAccessLevel,
                        dataAccessLevel,
                    });

                if (inputParserError) {
                    throw new InputParseError('Invalid Error', {
                        cause: inputParserError,
                    });
                }

                //await applyRateLimit('create-apitoken', 10, 60000);

                const authUser = await assertAuthenticated();

                const apiToken = await createApiTokenUseCase(data, authUser);

                return {
                    data: apiToken,
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

export const deleteApiKeyAction = async (action: string) => {
    const apikey = await deleteApiTokenUseCase(action);

    return apikey;
};
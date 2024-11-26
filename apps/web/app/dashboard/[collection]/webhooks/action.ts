'use server';

import { actionClient } from '@/lib/safe-action';
import { InputParseError } from '@/entities/errors/common';
import { applyRateLimit, handleCommonErrors } from '@/utils/handler';
import { assertAuthenticated } from '@/lib/session';
import { WebHook } from '@/validation/WebHook';
import {
    createWebHookUseCase,
    deleteWebHookUseCase,
} from '@/use-cases/webhook';

export const createWebHookAction = actionClient
    .schema(WebHook)
    .action(async ({ parsedInput: { name, tableAccess, webUrl } }) => {
        try {
            const { data, error: inputParserError } = WebHook.safeParse({
                name,
                webUrl,
                tableAccess,
            });

            if (inputParserError) {
                throw new InputParseError('Invalid Error', {
                    cause: inputParserError,
                });
            }

            //await applyRateLimit('webhook-create', 10, 60000);

            const authUser = await assertAuthenticated();

            const webhook = await createWebHookUseCase(data, authUser);

            return {
                data: webhook,
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
    });

export const deleteWebHookAction = async (id: string) => {
    const authUser = await assertAuthenticated();
    const deletedWebHook = await deleteWebHookUseCase(id, authUser);

    return deletedWebHook;
};

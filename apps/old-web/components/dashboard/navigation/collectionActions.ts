'use server';
import { InputParseError } from '@/entities/errors/common';
import { actionClient } from '@/lib/safe-action';
import { assertAuthenticated } from '@/lib/session';
import {
    createCollectionUseCase,
    deleteCollectionUseCase,
    updateCollectionUseCase,
} from '@/use-cases/collection';
import { applyRateLimit, handleCommonErrors } from '@/utils/handler';
import {
    createCollection,
    updateCollectionSchema,
} from '@/validation/collection';

export const createCollectionaction = actionClient
    .schema(createCollection)
    .action(async ({ parsedInput: { name } }) => {
        try {
            const { data, error: inputParseError } = createCollection.safeParse(
                {
                    name,
                }
            );

            if (inputParseError) {
                throw new InputParseError('Invalid data', {
                    cause: inputParseError,
                });
            }

            //await applyRateLimit('create-collection', 10, 60000);

            const authUser = await assertAuthenticated();

            const collection = await createCollectionUseCase(
                data.name,
                authUser
            );

            return {
                data: collection,
                status: 'success',
                error: null,
            };
        } catch (error) {
            const handledError = await handleCommonErrors(error);
            return {
                data: null,
                status: 'failed',
                error: handledError.error,
            };
        }
    });

export const updateCollectionAction = async (input: {
    id: string;
    name: string;
}) => {
    try {
        const { data, error: inputParseError } =
            updateCollectionSchema.safeParse(input);

        if (inputParseError) {
            throw new InputParseError('Invalid data', {
                cause: inputParseError,
            });
        }
        //await applyRateLimit('update-collection', 10, 60000);

        const authUser = await assertAuthenticated();

        const updatedcollection = await updateCollectionUseCase(data, authUser);

        return {
            data: updatedcollection,
            status: 'success',
            error: null,
        };
    } catch (error) {
        const handledError = await handleCommonErrors(error);
        return {
            data: null,
            status: 'failed',
            error: handledError.error,
        };
    }
};

export const deleteCollectionAction = async (collectionId: string) => {
    const collection = await deleteCollectionUseCase(collectionId);
    return collection;
};

'use server';

import { createUser } from '@/data-access/users';
import { actionClient } from '@/lib/safe-action';
import { createRoleSchema } from '@/validation/role';
import { z } from 'zod';

export const createNewRole = actionClient
    .schema(createRoleSchema)
    .action(async ({ parsedInput: { email, role } }) => {
        const user = await createUser(email, role);

        if (user.id) {
            return {
                data: user,
                status: 'success',
            };
        }

        return {
            data: null,
            status: 'failed',
        };
    });
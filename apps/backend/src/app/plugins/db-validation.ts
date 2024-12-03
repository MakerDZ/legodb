import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import logger from '../../shared/logger';
import db from '../../libs/prisma';

const validateDatabaseAccess: FastifyPluginAsync = async (fastify) => {
    fastify.decorateRequest(
        'validateDatabaseAccess',
        async function (token: string) {
            try {
                const validAccess = await db.tableAccessToken.findUnique({
                    where: { token },
                });
                return validAccess;
            } catch (err) {
                logger.error(err);
                return null;
            }
        }
    );
};

export default fp(validateDatabaseAccess, {
    name: 'database-access-validation-plugin',
});

declare module 'fastify' {
    interface FastifyRequest {
        validateDatabaseAccess: (token: string) => Promise<{
            name: string;
            id: string;
            token: string;
            tableAccess: string;
            databaseID: string;
            actionAccessLevel: string[];
        } | null>;
    }
}
